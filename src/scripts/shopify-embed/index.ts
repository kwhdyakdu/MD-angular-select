import { CustomerData, Currency } from 'types/shopify-embed.types'
import { Store } from 'types/contenful.types'
import { addModaMatchButton } from './modamatch-button'
import styles from './index.scss'
import { createIframe, openIframe } from './iframe'
import { initGa } from './ga'

/**
 * Config get's appended to global window in /api/shopify/[shopifyId]/script
 */
export const modamatchConfig = (window as any).MODAMATCH_CONFIG as {
  shopId: string
  host: string
  protocol: string
  store: Store
  gaTagId: string
}

export const customerData = (): CustomerData => {
  const targetElement = document.getElementById('modamatch')
  return {
    id: targetElement?.dataset.customerId,
    email: targetElement?.dataset.customerEmail,
    locale: (window as any).Shopify.locale
  }
}

export const customerCurrency = (): Currency => {
  return (window as any).Shopify.currency
}

const targetElement = document.getElementById('modamatch')
if (targetElement) {
  initGa()

  // we use shadow dom here so any shopify styles don't interfere with our elements
  const buttonShadow = targetElement.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = styles.toString()
  buttonShadow.appendChild(style)

  const overlayContainer = document.createElement('div')
  const overlayShadow = overlayContainer.attachShadow({ mode: 'open' })
  overlayShadow.appendChild(style.cloneNode(true))
  document.body.appendChild(overlayContainer)

  createIframe(overlayShadow)
  addModaMatchButton(buttonShadow, () => openIframe(overlayShadow))
}
