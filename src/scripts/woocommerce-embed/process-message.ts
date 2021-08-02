import { SHOPIFY_MESSAGE_TYPE } from 'types/shopify-embed.types'
import { awaitMap } from 'utils/general-utils'
import { customerData, customerCurrency, getSiteUrl } from '.'
import { closeIframe } from './iframe'

// wordpress path names: expects settings -> permalink structure to be `Post name - http://yoursite.com/sample-post/`
// else replace /cart?... with /?pageid=<cartPageId>&...
// on a fresh install that pageid is 7

export const processMessage = async (
  data: { type: SHOPIFY_MESSAGE_TYPE; parameters: { [key: string]: any } },
  shadowRoot: ShadowRoot
) => {
  if (data.type === SHOPIFY_MESSAGE_TYPE.CLOSE) {
    closeIframe(shadowRoot)
    return null
  }
  if (data.type === SHOPIFY_MESSAGE_TYPE.GET_CUSTOMER) {
    return customerData()
  }
  if (data.type === SHOPIFY_MESSAGE_TYPE.ADD_CART) {
    const siteUrl = getSiteUrl()
    const items = data.parameters.items as Array<{ id: number; quantity: number }>
    const responses = await awaitMap(items, ({ id, quantity }) => {
      return fetch(`${siteUrl}/cart/?add-to-cart=${id}&quantity=${quantity}`, {
        method: 'GET',
        // uses user cookies
        credentials: 'include'
      }).then(async (response) => {
        if (response.status >= 400 && response.status < 600) {
          throw new Error(`Add to cart responded with code ${response.status}`)
        }
        return response.status
      })
    })
    const lastResponse = responses[responses.length ? responses.length - 1 : 0]
    return lastResponse
  }
  if (data.type === SHOPIFY_MESSAGE_TYPE.GET_CURRENCY) {
    return customerCurrency()
  }
  if (data.type === SHOPIFY_MESSAGE_TYPE.CHECKOUT_CART) {
    const siteUrl = getSiteUrl()
    window.location.href = `${siteUrl}/checkout/`
    closeIframe(shadowRoot)
    return null
  }

  if (data.type === SHOPIFY_MESSAGE_TYPE.GA_PAGEVIEW) {
    const { url, title } = data.parameters
    window.ga('modamatch.send', 'pageview', {
      page: url,
      title
    })
    return null
  }

  if (data.type === SHOPIFY_MESSAGE_TYPE.GA_EVENT) {
    const { action, category, label, value } = data.parameters

    window.ga('modamatch.send', 'event', category, action, label, value)
    return null
  }
  return null
}
