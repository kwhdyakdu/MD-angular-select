import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { commonMiddlewares } from 'server/middlewares'
import { ShopifySessionApiRequest, withShopifySessionToken } from 'server/middlewares/with-shopify-session-token'
import { shopifyService } from 'server/services'

export default nextConnect<ShopifySessionApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  .use(withShopifySessionToken)
  .get(async (req, res) => {
    const { theme } = await shopifyService.getMainTheme(req.shopName)
    return res.status(200).send({ theme })
  })
