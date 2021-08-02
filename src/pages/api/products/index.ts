import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { productService } from 'server/services'
import { ITEMS_PER_PAGE } from 'server/config/pagination'
import safeJsonStringify from 'safe-json-stringify'
import { clamp } from 'utils/general-utils'

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  /**
   * Gets a list of shopify products for the given shopId
   */
  .get(async (req, res) => {
    const shopName = req.query.shopName?.toString()
    const rawIds = Array.isArray(req.query.ids) ? req.query.ids : [req.query.ids]
    const ids = rawIds.length > 0 && rawIds[0] !== undefined ? rawIds : undefined
    const categoryId = req.query.categoryId?.toString()
    const priceRange = Array.from(req.query.priceRange ?? [0, 0]).map((price) => Number(price))
    const sortBy = req.query.sortBy?.toString()
    const page = Number(req.query.page ?? 0)
    const limit = clamp(Number(req.query.limit ?? 0), 0, 100)
    const itemsPerPage = limit || ITEMS_PER_PAGE

    if (!shopName) {
      return res.status(400).send({ errorCode: 'InvalidParameters', errorMessage: 'Invalid shopName' })
    }

    try {
      const products = await productService.getProductList(shopName, {
        ids,
        categoryId,
        priceRange,
        sortBy,
        skip: page * itemsPerPage,
        limit: itemsPerPage
      })

      return res.send(safeJsonStringify({ products }))
    } catch (err) {
      console.error('Error in api/products/index', err)
      return res.status(500).send({ errorCode: 'UnexpectedError', errorMessage: 'An unexpected error occured' })
    }
  })
