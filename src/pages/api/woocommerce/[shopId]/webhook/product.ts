import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { validateWoocommerceWebhookHmac } from 'server/utils/validate-hmac'
import { parseBody } from 'server/utils/parse-body'
import { Product } from 'server/models/product'
import { contentfulService } from 'server/services'

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
      let body: any
      try {
        body = JSON.parse(rawBody.toString())
      } catch (err) {
        console.error('Error in parsing req.body', err)
        return res.status(400).send('Error in parsing req.body')
      }

      // header & meta data
      const { 'x-wc-webhook-event': event, 'x-wc-webhook-signature': signature } = req.headers
      const { shopId } = req.query
      const shopType = 'woocommerce'
      const shopName = shopId?.toString() ?? ''
      const woocommerceStore = await contentfulService.getStoreByStoreName(shopName)
      const secret = woocommerceStore?.fields.secretKey

      // events check
      const createEvents = ['created', 'updated']
      const deleteEvents = ['deleted']
      const isCreateEvent = createEvents.includes(event?.toString() ?? '') && body.status !== 'draft'
      const isDeleteEvent = deleteEvents.includes(event?.toString() ?? '') || body.status === 'draft'
      const isVariant = isCreateEvent && body.parent_id !== 0

      // return if shop name is invalid
      if (!shopName) {
        console.error('Invalid shop name')
        return res.status(400).send('Invalid or Missing shop name')
      }

      // return if hmac failed
      if (!validateWoocommerceWebhookHmac(signature?.toString() ?? '', secret?.toString() ?? '', rawBody)) {
        console.error('HMAC validation failed')
        return res.status(400).send('HMAC validation failed')
      }

      // Check for existing product w/ woocommerce id in mongoDB
      let product = await Product.findOne({ externalId: body.id, type: shopType, shopName })

      // **************************************************
      // is creation or update event
      if (isCreateEvent) {
        // Check if product is a VARIANT (of another product)
        if (isVariant) {
          // check if product exists on Contentful
          const contentfulItem = await contentfulService.getItemByShopifyId(body.parent_id.toString())
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const additionalImages = contentfulItem?.fields.additionalPhotos?.map(({ fields }) => fields.file.url) ?? []
          const carouselImages = [contentfulItem?.fields.mainThumbnail.fields.file.url, ...additionalImages] ?? []

          // Re-Check for existing product w/ woocommerce parent_id in mongoDB
          product = await Product.findOne({ externalId: body.parent_id, type: shopType, shopName })

          // Create new product if doesn't exist in mongoDB
          if (!product || !product.shopifyData) {
            return res.send(null)
          }

          // Destructuring data into option0 = "S", option1 = "Blue" ...
          const variantOptions = body.attributes.reduce((acc: any, val: { option: string }, idx: Number) => {
            acc[`option${idx}`] = val.option
            return acc
          }, {})

          if (product.shopifyData.variants) {
            // find & filter out instance (for update or deletion)
            product.shopifyData.variants = product.shopifyData.variants.filter((variant) => variant.id !== body.id)
          }

          // append new product variant
          product.shopifyData = {
            ...product.shopifyData,
            variants: [
              ...(product.shopifyData.variants || []),
              {
                id: body.id,
                product_id: body.parent_id,
                title: body.name,
                price: Number(body.price) * 100,
                image_id: null,
                ...variantOptions
              }
            ]
          }

          product.contentfulId = contentfulItem?.sys.id
          product.contentfulCategoryId = contentfulItem?.fields.category.sys.id
          product.enabled = !!(product.shopifyData && product.contentfulId)
          product.mainImageUrl = contentfulItem?.fields.mainThumbnail.fields.file.url
          // eslint-disable-next-line @typescript-eslint/no-shadow
          product.additionalImages = carouselImages

          await product.save()
          return res.send(null)
        }

        // Check if product is NOT a VARIANT (of another product)
        if (!isVariant) {
          // check if product exists on Contentful
          const contentfulItem = await contentfulService.getItemByShopifyId(body.id.toString())
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const additionalImages = contentfulItem?.fields.additionalPhotos?.map(({ fields }) => fields.file.url) ?? []
          const carouselImages = [contentfulItem?.fields.mainThumbnail.fields.file.url, ...additionalImages] ?? []

          // Create new product if doesn't exist in mongoDB
          if (!product) {
            product = new Product({ externalId: body.id, type: shopType, shopName })
          }

          // update values that might have changed
          product.title = body.name
          product.price = Number(body.price) * 100
          product.imageUrl = body.images?.[0]?.src
          product.description = body.description
          product.short_description = body.short_description
          product.shopifyData = {
            body_html: body.description,
            options:
              body.attributes?.map((option: any) => ({ ...option, values: option.values ?? option.options })) ?? [],
            variants: product.shopifyData?.variants || [
              {
                id: body.id,
                product_id: body.id,
                price: Number(body.price) * 100,
                option1: '',
                option2: '',
                image_id: null
              }
            ],
            ...body
          }
          product.contentfulId = contentfulItem?.sys.id
          product.contentfulCategoryId = contentfulItem?.fields.category.sys.id
          product.enabled = !!(product.shopifyData && product.contentfulId)
          product.mainImageUrl = contentfulItem?.fields.mainThumbnail.fields.file.url
          // eslint-disable-next-line @typescript-eslint/no-shadow
          product.additionalImages = carouselImages

          await product.save()
          return res.send(null)
        }
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

      console.log('Invalid webhook event', event)
      return res.status(400).send('Invalid webhook event')
    } catch (err) {
      console.error('Error in woocommerce/[shopId]/webhook/product', err)
      return res.status(500).send(null)
    }
  })
