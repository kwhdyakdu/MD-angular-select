import { modamatchConfig } from '.'
import { processMessage } from './process-message'

export const createIframe = (shadowRoot: ShadowRoot) => {
  const { host, protocol, shopId } = modamatchConfig

  const iframeContainer = document.createElement('div')
  iframeContainer.className = 'modal'

  const iframeElement = document.createElement('iframe')
  iframeElement.src = `${protocol}://${host}/shopify/${shopId}`

  window.addEventListener('message', async (e) => {
    if (e.origin !== `${protocol}://${host}`) return

    try {
      const response = await processMessage(e.data, shadowRoot)
      iframeElement.contentWindow?.postMessage({ responseTo: e.data.id, payload: response }, e.origin)
    } catch (error) {
      iframeElement.contentWindow?.postMessage({ responseTo: e.data.id, payload: error, isError: true }, e.origin)
    }
  })

  iframeContainer.appendChild(iframeElement)
  shadowRoot.appendChild(iframeContainer)

  return iframeContainer
}

export const openIframe = (shadowRoot: ShadowRoot) => {
  let modal = shadowRoot.querySelector('.modal')
  if (!modal) {
    modal = createIframe(shadowRoot)
  }

  modal.classList.add('visible')
  document.body.style.overflow = 'hidden'

  window.ga('modamatch.send', 'event', 'App', 'Opened', modamatchConfig.shopId)
}

export const closeIframe = (shadowRoot: ShadowRoot) => {
  shadowRoot.querySelector('.modal')?.classList.remove('visible')
  // reset to original url
  const iframe = shadowRoot.querySelector<HTMLIFrameElement>('.modal iframe')
  iframe?.contentWindow?.location.replace(iframe?.src)
  document.body.style.overflow = 'inherit'

  window.ga('modamatch.send', 'event', 'App', 'Closed', modamatchConfig.shopId)
}
