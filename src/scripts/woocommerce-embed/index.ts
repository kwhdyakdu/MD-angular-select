import { CustomerData, Currency } from 'types/shopify-embed.types'
import { Store } from 'types/contenful.types'
import { addModaMatchButton } from './modamatch-button'
import styles from './index.scss'
import { createIframe, openIframe } from './iframe'
import { initGa } from './ga'

/**
 * Config get's appended to global window in /api/woocommerce/[shopifyId]/script
 */
export const modamatchConfig = (window as any).MODAMATCH_CONFIG as {
  shopId: string
  host: string
  protocol: string
  store: Store
  gaTagId: string
}

export const customerData = (): CustomerData => {
  return {
    id: (window as any)?.Woocommerce?.customerId,
    email: (window as any)?.Woocommerce?.customerEmail,
    locale: (window as any)?.Woocommerce?.customerLocale ?? 'en'
  }
}

export const customerCurrency = (): Currency => {
  return {
    active: (window as any)?.Woocommerce?.currencyCode ?? '',
    rate: (window as any)?.Woocommerce?.currencyRate ?? ''
  }
}

export const getSiteUrl = (): string => {
  return (window as any)?.Woocommerce?.siteUrl ?? ''
}

initGa()

document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style')
  style.textContent = styles.toString()

  const overlayContainer = document.createElement('div')
  const overlayShadow = overlayContainer.attachShadow({ mode: 'open' })
  overlayShadow.appendChild(style.cloneNode(true))
  document.body.appendChild(overlayContainer)

  createIframe(overlayShadow)
  addModaMatchButton((e) => {
    e.preventDefault()
    openIframe(overlayShadow)
  })
})
