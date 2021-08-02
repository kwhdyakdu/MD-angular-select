import { NextApiRequest, NextApiResponse } from 'next'
import qs from 'qs'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { contentfulService } from 'server/services'
import { getNextQueryString } from 'server/utils/get-next-query-string'
import { GetTryOnItemsRequest, GetTryOnItemsResponse } from 'types/modamatch.types'
import safeJsonStringify from 'safe-json-stringify'
import { TRY_ON_ITEMS_LIMIT } from 'server/config/pagination'

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  /**
   * Gets a list of contentful tryonitems for the given contentful product ids
   */
  .get(async (req, res) => {
    try {
      // parse query string
      const queryString = getNextQueryString(req)
      const query = (qs.parse(queryString, { arrayLimit: TRY_ON_ITEMS_LIMIT }) ?? {}) as GetTryOnItemsRequest
      const { storeId, modelId, items } = query

      // validate
      const isValidItems = items
        ? Array.isArray(items) &&
          items.every(({ productId, contentfulId }) => productId !== undefined && contentfulId !== undefined)
        : true
      if (!storeId || !modelId || !isValidItems) {
        console.error('Invalid query params supplied to api/contentful/try-on-items/index', query)
        return res.status(400).send({ errorCode: 'InvalidParameters', errorMessage: 'Invalid query params supplied' })
      }
      if (!items) {
        return res.status(200).send({
          storeId,
          modelId,
          items: []
        })
      }

      // get results
      const resultItems = await contentfulService.getTryOnItems(storeId, modelId, items)
      const response: GetTryOnItemsResponse = {
        items: resultItems
      }

      // return
      return res.send(safeJsonStringify(response))
    } catch (err) {
      console.error('Error in api/contentful/try-on-items/index', err)
      return res.status(500).send({ errorCode: 'UnexpectedError', errorMessage: 'An unexpected error occured' })
    }
  })
