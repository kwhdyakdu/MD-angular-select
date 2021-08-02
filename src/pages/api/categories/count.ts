import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { productService } from 'server/services'

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  /**
   * Counts items in the given list of categories
   */
  .get(async (req, res) => {
    const shopName = req.query.shopName?.toString()
    const ids = Array.isArray(req.query.ids) ? req.query.ids : [req.query.ids]
    const priceRange = Array.from(req.query.priceRange ?? [0, 0]).map((price) => Number(price))

    if (!shopName) {
      return res.status(400).send({ errorCode: 'InvalidParameters', errorMessage: 'Invalid shopName' })
    }

    try {
      const categoryTotals = await Promise.all(
        ids.map((id) =>
          productService.countProducts(shopName, {
            categoryId: id,
            priceRange
          })
        )
      )
      return res.send(categoryTotals)
    } catch (err) {
      console.error('Error in api/categories/count', err)
      return res.status(500).send({ errorCode: 'UnexpectedError', errorMessage: 'An unexpected error occured' })
    }
  })
