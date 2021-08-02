import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { Product } from 'server/models/product'
import { contentfulService, shopifyService } from 'server/services'
import { awaitMap } from 'utils/general-utils'

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  // webhook that gets called on contentful entry events
  .post(async (req, res) => {
    try {
      // header & meta data
      const { 'x-contentful-topic': topic, 'webhook-secret': webhookSecret } = req.headers
      const { sys, fields } = req.body
      const { shopifyId, store, category } = fields ?? {}
      const shopId = store ? (Object.values(store)[0] as any) : undefined
      const storeEntry = shopId ? await contentfulService.getStoreById(shopId?.sys?.id) : undefined
      const shopType = storeEntry?.fields.storeType ? 'shopify' : 'woocommerce'
      const shopName = storeEntry?.fields.storeId ?? ''
      const productId = shopifyId ? Number(Object.values(shopifyId)[0]) : undefined
      const deletedContentfulId = sys?.id as string | undefined

      // events check
      const createEvents = [
        'ContentManagement.Entry.publish',
        'ContentManagement.Entry.unarchive',
        'ContentManagement.Entry.create',
        'ContentManagement.Entry.save',
        'ContentManagement.Entry.auto_save'
      ]
      const deleteEvents = [
        'ContentManagement.Entry.unpublish',
        'ContentManagement.Entry.archive',
        'ContentManagement.Entry.delete'
      ]
      const isCreateEvent = createEvents.includes(topic?.toString() ?? '')
      const isDeleteEvent = deleteEvents.includes(topic?.toString() ?? '')

      // return if hmac failed
      if (!webhookSecret || webhookSecret !== process.env.CONTENTFUL_WEBHOOK_SECRET) {
        return res.status(400).send('Invalid webhook secret')
      }

      // **************************************************
      // is creation or update event
      if (isCreateEvent) {
        const item = await contentfulService.getItemById(sys.id)
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const additionalImages = item.fields.additionalPhotos?.map(({ fields }) => fields.file.url) || []
        const carouselImages = [item.fields.mainThumbnail.fields.file.url, ...additionalImages]

        // return if item doesn't have shopify id
        if (!fields?.shopifyId) {
          console.info('Skipping contentful item without shopifyId')
          return res.send(null)
        }

        // return if store is invalid
        if (!store || !productId) {
          console.info('Skipping contentful item without valid storeId or productId')
          return res.send(null)
        }

        // return if shop name is invalid
        if (!shopName) {
          return res.status(400).send('Invalid or Missing shop name')
        }

        // get or create product
        let product = await Product.findOne({ externalId: productId, type: shopType, shopName })

        // create product if invalid
        if (!product) {
          product = new Product({ externalId: productId, type: shopType, shopName })
        }

        // if shopify -> shopify calls -> data & save
        if (shopType === 'shopify') {
          const shopifyClient = await shopifyService.getShopifyClient(shopName)
          const shopifyProduct = await shopifyClient.product.get(Number(Object.values(shopifyId)[0]))
          product.title = shopifyProduct.title
          product.price = Number(shopifyProduct.variants[0].price) * 100
          product.imageUrl = shopifyProduct.image?.src
          product.shopifyData = shopifyProduct
        }
        // update values that might have changed
        product.contentfulId = sys.id
        product.contentfulCategoryId = (Object.values(category)[0] as any)?.sys?.id
        product.enabled = !!(product.shopifyData && product.contentfulId)
        product.mainImageUrl = item.fields.mainThumbnail.fields.file.url
        // eslint-disable-next-line @typescript-eslint/no-shadow
        product.additionalImages = carouselImages

        await product.save()
        return res.send(null)
      }

      // **************************************************
      // is deletion event
      if (isDeleteEvent) {
        // return if unpublish id is invalid
        if (!deletedContentfulId) {
          return res.send(null)
        }

        // find all products with this contentful id, clear it's contentful references or delete them
        const products = await Product.find({ contentfulId: deletedContentfulId })
        await awaitMap(products, async (product) => {
          if (product.shopifyData) {
            product.contentfulId = undefined
            product.contentfulCategoryId = undefined
            product.enabled = false

            return product.save()
          }
          return Product.deleteOne({ contentfulId: deletedContentfulId })
        })
        return res.send(null)
      }

      console.log('Invalid webhook event', topic)
      return res.status(400).send('Invalid webhook event')
    } catch (err) {
      console.error('Error in contentful/webhook/item', err)
      return res.status(500).send(null)
    }

    return res.send(null)
  })
