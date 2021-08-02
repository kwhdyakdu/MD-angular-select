import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import path from 'path'
import fs from 'fs/promises'
import nextConnect from 'next-connect'
import serialize from 'serialize-javascript'
import { contentfulService } from 'server/services'

const { GA_TRACKING_ID = '' } = process.env

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  .get(async (req, res) => {
    const { shopId } = req.query

    const store = await contentfulService.getStoreByStoreName(shopId as string)
    if (!store) {
      return res.status(404).send(null)
    }

    const config = {
      shopId,
      // we use local-modamatch to test localhost
      host: shopId === 'local-modamatch-partner.myshopify.com' ? 'localhost:3000' : req.headers.host,
      protocol: shopId === 'local-modamatch-partner.myshopify.com' ? 'http' : 'https',
      store: store.fields,
      gaTagId: GA_TRACKING_ID
    }

    const filePath = path.join(process.cwd(), 'dist/shopify-embed.js')
    let jsContent = await fs.readFile(filePath).then((file) => file.toString())
    // inject config to the javascript entry point
    jsContent = `window['MODAMATCH_CONFIG'] = ${serialize(config)};${jsContent}`

    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
    return res.send(jsContent)
  })
