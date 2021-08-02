import { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { ClientRouter as ShopifyClientRouter, Provider as ShopifyBridgeProvider } from '@shopify/app-bridge-react'
import { AppProvider as ShopifyPolarisProvider } from '@shopify/polaris'
import polarisTranslations from '@shopify/polaris/locales/en.json'
import Link from 'next/link'
import { config } from '@fortawesome/fontawesome-svg-core'
import { CustomerPreferenceType } from 'server/models/customer-preference'
import { CartItem, FittingItem } from 'types/modamatch.types'
import { CustomerSettingsContext } from 'client/hooks/use-customer-settings'

// global css
import 'client/styles/main.scss'
import '@fortawesome/fontawesome-svg-core/styles.css'
import useAnalytics from 'client/hooks/use-analytics.service'

const { NEXT_PUBLIC_SHOPIFY_CLIENT_ID = '' } = process.env

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported abov

const App = ({ Component, pageProps, router }: AppProps) => {
  const { pageview } = useAnalytics()
  const [model, setModel] = useState<CustomerPreferenceType['model'] | null>(null)
  const [fittingItems, setFittingItems] = useState<FittingItem[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  // track page views
  useEffect(() => {
    const handleRouteChange = (url: URL | string) => {
      pageview(url)
    }

    handleRouteChange(window.location.pathname)
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, pageview])

  // shopify admin pages need to use shopify's app bridge
  if (router.pathname.startsWith('/shopify-admin')) {
    return (
      <ShopifyBridgeProvider
        config={{
          apiKey: NEXT_PUBLIC_SHOPIFY_CLIENT_ID,
          // this is only available on client side
          shopOrigin:
            (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('shop')) || 'localhost',
          forceRedirect: false
        }}
      >
        <ShopifyClientRouter history={router} />
        <ShopifyPolarisProvider
          i18n={polarisTranslations}
          linkComponent={({ url = '', children, external, ...props }) =>
            external ? (
              <a href={url} {...props} target="_blank" rel="noreferrer">
                {children}
              </a>
            ) : (
              <Link href={url}>
                <a {...props}>{children}</a>
              </Link>
            )
          }
        >
          <Component {...pageProps} />
        </ShopifyPolarisProvider>
      </ShopifyBridgeProvider>
    )
  }

  return (
    <CustomerSettingsContext.Provider
      value={{ model, setModel, fittingItems, setFittingItems, cartItems, setCartItems }}
    >
      <Component {...pageProps} />
    </CustomerSettingsContext.Provider>
  )
  // return <Component {...pageProps} />
}

export default App
