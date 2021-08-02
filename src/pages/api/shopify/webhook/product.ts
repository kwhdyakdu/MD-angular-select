import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { validateShopifyWebhookHmac } from 'server/utils/validate-hmac'
import { parseBody } from 'server/utils/parse-body'
import { IProduct } from 'shopify-api-node'
import { Product } from 'server/models/product'
import { contentfulService } from 'server/services'

type IProductWithStatus = IProduct & {
  status?: string
}

// we need the raw body for validating webhooks
export const config = {
  api: {
    bodyParser: false
  }
}

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  // webhook that gets called on product events
  .post(async (req, res) => {
    try {
      // body parser
      const rawBody = await parseBody(req)
      let body: IProductWithStatus
      try {
        body = JSON.parse(rawBody.toString())
      } catch (err) {
        console.error('Error in parsing req.body', err)
        return res.status(400).send('Error in parsing req.body')
      }

      // header & meta data
      const {
        'x-shopify-topic': topic,
        'x-shopify-hmac-sha256': signature,
        'x-shopify-shop-domain': shopId
      } = req.headers
      const shopType = 'shopify'
      const shopName = shopId?.toString() ?? ''
      const shopifyStore = await contentfulService.getStoreByStoreName(shopName)
      const secret = shopifyStore?.fields.secretKey

      // events check
      const createEvents = ['products/create', 'products/update']
      const deleteEvents = ['products/delete']
      const isCreateEvent = createEvents.includes(topic?.toString() ?? '') && body.status !== 'draft'
      const isDeleteEvent = deleteEvents.includes(topic?.toString() ?? '') || body.status === 'draft'

      // return if shop name is invalid
      if (!shopName) {
        console.error('Invalid shop name')
        return res.status(400).send('Invalid or Missing shop name')
      }

      // return if hmac failed
      if (!validateShopifyWebhookHmac(signature?.toString() ?? '', secret?.toString() ?? '', rawBody)) {
        console.error('HMAC validation failed')
        return res.status(400).send('HMAC validation failed')
      }

      // check if product exists on Contentful
      const contentfulItem = await contentfulService.getItemByShopifyId(body.id.toString())
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const additionalImages = contentfulItem?.fields.additionalPhotos?.map(({ fields }) => fields.file.url) ?? []
      const carouselImages = [contentfulItem?.fields.mainThumbnail.fields.file.url, ...additionalImages] ?? []

      // get or create product
      let product = await Product.findOne({ externalId: body.id, type: shopType, shopName })

      // **************************************************
      // is creation or update event
      if (isCreateEvent) {
        // create product if invalid
        if (!product) {
          product = new Product({ externalId: body.id, type: shopType, shopName })
        }

        // update values that might have changed
        product.title = body.title
        product.price = Number(body.variants[0].price) * 100
        product.imageUrl = body.image?.src
        product.shopifyData = body
        product.contentfulId = contentfulItem?.sys.id
        product.contentfulCategoryId = contentfulItem?.fields.category.sys.id
        product.mainImageUrl = contentfulItem?.fields.mainThumbnail.fields.file.url
        // eslint-disable-next-line @typescript-eslint/no-shadow
        product.additionalImages = carouselImages
        product.enabled = !!(product.shopifyData && product.contentfulId)

        await product.save()
        return res.send(null)
      }

      // **************************************************
      // is deletion event
      if (isDeleteEvent) {
        if (!product) {
          return res.send(null)
        }
        if (product.contentfulId) {
          product.title = undefined
          product.price = undefined
          product.imageUrl = undefined
          product.description = undefined
          product.short_description = undefined
          product.shopifyData = undefined
          product.enabled = false

          await product.save()
          return res.send(null)
        }

        await Product.deleteOne({ externalId: body.id, type: shopType, shopName })
        return res.send(null)
      }

      console.log('Invalid webhook event', topic)
      return res.status(400).send('Invalid webhook event')
    } catch (err) {
      console.error('Error in shopify/webhook/product', err)
      return res.status(500).send(null)
    }
  })
