import { SHOPIFY_MESSAGE_TYPE } from 'types/shopify-embed.types'
import { customerData, customerCurrency } from '.'
import { closeIframe } from './iframe'

export const processMessage = async (
  data: { type: SHOPIFY_MESSAGE_TYPE; parameters: { [key: string]: any } },
  shadowRoot: ShadowRoot
) => {
  switch (data.type) {
    case SHOPIFY_MESSAGE_TYPE.CLOSE:
      closeIframe(shadowRoot)
      return null
    case SHOPIFY_MESSAGE_TYPE.GET_CUSTOMER:
      return customerData()
    case SHOPIFY_MESSAGE_TYPE.ADD_CART:
      // https://shopify.dev/docs/themes/ajax-api/reference/cart
      return fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: data.parameters.items })
      }).then(async (response) => {
        if (response.status >= 400 && response.status < 600) {
          throw await response.json()
        }
        return response.json()
      })
    case SHOPIFY_MESSAGE_TYPE.GET_CURRENCY:
      return customerCurrency()
    case SHOPIFY_MESSAGE_TYPE.CHECKOUT_CART:
      window.location.href = '/checkout'
      closeIframe(shadowRoot)
      return null
    case SHOPIFY_MESSAGE_TYPE.GA_PAGEVIEW: {
      const { url, title } = data.parameters

      window.ga('modamatch.send', 'pageview', {
        page: url,
        title
      })

      return null
    }
    case SHOPIFY_MESSAGE_TYPE.GA_EVENT: {
      const { action, category, label, value } = data.parameters

      window.ga('modamatch.send', 'event', category, action, label, value)

      return null
    }
    default:
      return null
  }
}
