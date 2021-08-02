import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { Currency, CustomerData, SHOPIFY_MESSAGE_TYPE } from 'types/shopify-embed.types'
import { v4 as uuidv4 } from 'uuid'

export const useShopifyEmbed = () => {
  const { query } = useRouter()
  const storeId = query.storeId as string | undefined

  /**
   * Post a message to our shopify-embed script and return the response
   */
  const postMessage = useCallback(
    async (type: SHOPIFY_MESSAGE_TYPE, parameters?: { [key: string]: any }) =>
      storeId &&
      new Promise<any>((resolve, reject) => {
        const id = uuidv4()

        const onMessage = (e: MessageEvent) => {
          // we only listen to responses to the request id we generated earlier
          if (e.data?.responseTo !== id) return
          clearTimeout(timeout)

          window.removeEventListener('message', onMessage)
          if (e.data?.isError) {
            reject(e.data?.payload)
          } else {
            resolve(e.data?.payload)
          }
        }

        // listen for a response
        window.addEventListener('message', onMessage)

        // reject if we don't get a response after a while
        const timeout = setTimeout(() => {
          reject()
          window.removeEventListener('message', onMessage)
        }, 10000)

        // post the message to our shopify-embed script
        window.parent.postMessage({ id, type, parameters }, '*')
      }),
    [storeId]
  )

  const [customer, setCustomer] = useState<CustomerData>()
  useEffect(() => {
    postMessage(SHOPIFY_MESSAGE_TYPE.GET_CUSTOMER)
      .then(setCustomer)
      .catch((e) => {
        console.error('Could not fetch customer from shopify', e)
        setCustomer({ locale: 'en' })
      })
  }, [postMessage])

  const [currency, setCurrency] = useState<Currency>()
  useEffect(() => {
    postMessage(SHOPIFY_MESSAGE_TYPE.GET_CURRENCY)
      .then(setCurrency)
      .catch((e) => {
        console.error('Could not fetch currency from shopify', e)
        setCurrency({ active: 'USD', rate: '1.0' })
      })
  }, [postMessage])

  /**
   * Formats the given number as currency using customer language and shop currency
   */
  const formatCurrency = useCallback(
    (price?: number | string) => {
      if (price === undefined) {
        return '...'
      }

      if (typeof price === 'number') {
        price /= 100
      } else {
        price = Number(price)
      }

      return price.toLocaleString(customer?.locale ?? 'en', {
        style: 'currency',
        currency: currency?.active ?? 'USD'
      })
    },
    [currency, customer]
  )

  return { postMessage, customer, currency, formatCurrency }
}
