import { useCallback } from 'react'
import { SHOPIFY_MESSAGE_TYPE } from 'types/shopify-embed.types'
import { useShopifyEmbed } from './use-shopify-embed.hook'

type GTagEvent = {
  action: string
  category: string
  label?: string
  value?: number
}

/**
 * Hook to faciliate analytics through google analytics
 * Events and pageviews get passed down to the embed script via post message, to circumvent third party cookie blocking
 */
const useAnalytics = () => {
  const { postMessage } = useShopifyEmbed()

  // https://developers.google.com/analytics/devguides/collection/gtagjs/pages
  const pageview = useCallback(
    (url: URL | string) => {
      postMessage(SHOPIFY_MESSAGE_TYPE.GA_PAGEVIEW, { url, title: document.title })
    },
    [postMessage]
  )

  // https://developers.google.com/analytics/devguides/collection/gtagjs/events
  const event = useCallback(
    ({ action, category, label, value }: GTagEvent) => {
      postMessage(SHOPIFY_MESSAGE_TYPE.GA_EVENT, { category, action, label, value })
    },
    [postMessage]
  )

  return { pageview, event }
}

export default useAnalytics
