export enum SHOPIFY_MESSAGE_TYPE {
  CLOSE = 'close',
  ADD_CART = 'addCart',
  GET_CUSTOMER = 'getCustomer',
  GET_CURRENCY = 'getCurrency',
  CHECKOUT_CART = 'checkout',
  GA_PAGEVIEW = 'gaPageView',
  GA_EVENT = 'gaEvent'
}

export type CustomerData = {
  id?: string
  email?: string
  locale: string
}

export type Currency = {
  active: string
  rate: string
}
