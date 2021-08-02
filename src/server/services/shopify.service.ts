import querystring from 'querystring'
import { ShopifyStore } from 'server/models/shopify-store'
import Shopify from 'shopify-api-node'
import { contentfulService, shopifyService } from 'server/services'


const {SHOPIFY_DOMAIN } = process.env

export const shopRegex = new RegExp(`^[a-z0-9][a-z0-9\\-]*[a-z0-9]\\.${SHOPIFY_DOMAIN}$`, 'i')

export const getShopifyClient = async (shopName: string, accessToken?: string) => {
  const store = accessToken ? null : await ShopifyStore.findOne({ shopName })

  if (!accessToken && !store?.accessToken) {
    throw new Error(`Store ${shopName} doesn't have any access tokens`)
  }

  return new Shopify({
    shopName,
    accessToken: accessToken || store?.accessToken || '',
    autoLimit: true
  })
}

export const fetchAccessToken = async (shop: string, code: string) => {

  // validate this shop has been whitelisted in contenful
  const store = await contentfulService.getStoreByStoreName(shop as string)
  if (!store) {
    return { errorCode: 'NoStore', errorMessage: 'Could not find a store' }
    // return res.redirect(`/shopify-admin/no-permission?${querystring.stringify({ shopId: shop })}`)
  }

  const accessTokenQuery = querystring.stringify({
    code,
    client_id: store.fields.shopifyClientId,
    client_secret: store.fields.shopifyApiSecret
  })

  // console.log(accessTokenQuery)
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(accessTokenQuery).toString()
    },
    body: accessTokenQuery
  })

  if (!response.ok) {
    return { errorCode: 'AccessTokenError', errorMessage: 'Could not fetch access token' }
  }

  const accessTokenData: {
    access_token: string
    scope: string
    expires_in: number
    associated_user_scope: string
    session: null
    associated_user: {
      id: number
      first_name: string
      last_name: string
      email: string
      account_owner: boolean
      locale: string
      collaborator: boolean
      email_verified: boolean
    }
  } = await response.json()

  return { data: accessTokenData }
}

export const initShopifyAppInstall = async (shopName: string, apiUrl: string, accessToken?: string) => {
  const shopify = await getShopifyClient(shopName, accessToken)

  // remove all old scriptTags
  const scriptTags = await shopify.scriptTag.list()
  await Promise.all(scriptTags.map((scriptTag) => shopify.scriptTag.delete(scriptTag.id)))

  // add custom shopify embed script
  await shopify.scriptTag.create({
    src: `${apiUrl}/api/shopify/${encodeURIComponent(shopName)}/script`,
    event: 'onload'
  })

  // remove old webhooks
  const webhooks = await shopify.webhook.list()
  await Promise.all(webhooks.map((webhook) => shopify.webhook.delete(webhook.id)))

  // add webhooks
  await shopify.webhook.create({
    address: `${apiUrl}/api/shopify/webhook/product`,
    topic: 'products/update',
    format: 'json'
  })
}

export const getMainTheme = async (
  shop: string
): Promise<{
  errorCode?: string
  errorMessage?: string
  theme?: Shopify.ITheme
}> => {
  const shopify = await getShopifyClient(shop)

  return shopify.theme
    .list()
    .then((themes) => ({ theme: themes.find((theme: any) => theme.role === 'main') }))
    .catch((err) => {
      console.error('Error in shopifyService.getTheme', err)
      return { errorCode: 'ThemeError', errorMessage: 'Could not fetch the current theme' }
    })
}
