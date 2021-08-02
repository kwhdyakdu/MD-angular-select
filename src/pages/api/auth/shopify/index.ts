import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { validateHmac } from 'server/utils/validate-hmac'
import querystring from 'querystring'
import { v4 as uuidv4 } from 'uuid'
import { contentfulService, shopifyService } from 'server/services'
import { setCookie } from 'nookies'





/**
 * Initializes oauth call to shopify
 * Called by shopify when someone is adding this app to a store
 */
export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  .get(async (req, res) => {
    const { hmac, shop } = req.query

    // validate this shop has been whitelisted in contenful
    const store = await contentfulService.getStoreByStoreName(shop as string)
    if (!store) {
      return res.redirect(`/shopify-admin/no-permission?${querystring.stringify({ shopId: shop })}`)
    }

    // const { store.fields.shopifyClientId, store.fields.shopifyApiSecret } = process.env


    if (Array.isArray(shop) || Array.isArray(hmac)) {
      return res.status(400).send(null)
    }

    if (shop == null || !shopifyService.shopRegex.test(shop)) {
      return res.status(400).send('Expected a valid shop query parameter')
    }

    if (!validateHmac(hmac, store.fields.shopifyApiSecret?.toString() ?? '', req.query)) {
      return res.status(400).send('HMAC validation failed')
    }

    const nonce = uuidv4()

    // we need these cookies to validate the oauth2 state
    setCookie({ res }, 'shopifyNonce', nonce, { sameSite: 'none', secure: true, path: '/' })

    // generate oauth2 permission uri
    const apiUrl = `https://${req.headers.host}`
    const redirectParams = {
      state: nonce,
      scope: 'write_script_tags,read_themes,read_products',
      client_id: store.fields.shopifyClientId,
      redirect_uri: `${apiUrl}/api/auth/shopify/callback`
    }

    const formattedQueryString = querystring.stringify(redirectParams)

    return res.redirect(`https://${shop}/admin/oauth/authorize?${formattedQueryString}`)
  })
