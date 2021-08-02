import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { validateHmac } from 'server/utils/validate-hmac'
import { contentfulService, shopifyService } from 'server/services'
import { ShopifyStore } from 'server/models/shopify-store'
import querystring from 'querystring'

// const { NEXT_PUBLIC_SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET } = process.env
// console.log()
/**
 * Processes oauth response from shopify
 * Called after shopify permission prompt has been accepted by user
 */

 
export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  .get(async (req, res) => {
    const { code, hmac, shop: shopName, state: nonce } = req.query
    
    // validate this shop has been whitelisted in contenful
    const store = await contentfulService.getStoreByStoreName(shopName as string)
    if (!store) {
      return res.redirect(`/shopify-admin/no-permission?${querystring.stringify({ shopId: shopName })}`)
    }

    // const { store.fields.shopifyClientId, store.fields.shopifyApiSecret } = process.env


    if (Array.isArray(shopName) || Array.isArray(hmac) || Array.isArray(code)) {
      return res.status(400).send(null)
    }

    if (nonce == null || req.cookies.shopifyNonce !== nonce) {
      return res.status(403).send('Request origin could not be verified')
    }

    if (shopName == null || !shopifyService.shopRegex.test(shopName)) {
      return res.status(400).send('Expected a valid shop query parameter')
    }

    if (!validateHmac(hmac, store.fields.shopifyApiSecret?.toString() ?? '', req.query)) {
      return res.status(400).send('HMAC validation failed')
    }

    const apiUrl = `https://${req.headers.host}`

    const {
      data,
      errorCode: accessTokenErrorCode,
      errorMessage: accessTokenErrorMessage
    } = await shopifyService.fetchAccessToken(shopName, code)
    if (!data) {
      return res.status(401).send({ errorCode: accessTokenErrorCode, errorMessage: accessTokenErrorMessage })
    }

    const { access_token: accessToken } = data

    try {
      let shop = await ShopifyStore.findOne({ shopName })
      if (shop) {
        // if this shop was setup before, we skip everything and just save the new access token
        shop.accessToken = accessToken
      } else {
        // otherwise we get the shop ready for use
        shop = await ShopifyStore.create({ shopName, accessToken })
      }
      await shopifyService.initShopifyAppInstall(shopName, apiUrl, accessToken)
      await shop.save()
    } catch (err) {
      console.error('Error during shopify app installation', err)
      return res.status(500).send({ errorCode: 'UnexpectedError', errorMessage: 'An unexpected error occurred' })
    }

    // finally we redirect to the install instructions inside our app section
    return res.redirect(
      `https://${shopName}/admin/apps/${store.fields.shopifyClientId}/shopify-admin/install-instructions`
    )
  })
