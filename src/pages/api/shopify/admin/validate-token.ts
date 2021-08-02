import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import { commonMiddlewares } from 'server/middlewares'
import { ShopifySessionApiRequest, withShopifySessionToken } from 'server/middlewares/with-shopify-session-token'

export default nextConnect<ShopifySessionApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  .use(withShopifySessionToken)
  .get((req, res) => {
    return res.status(200).send({ userId: req.sessionToken.sid, exp: req.sessionToken.exp, shop: req.shopName })
  })
