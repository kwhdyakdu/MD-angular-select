// global styles
import '@shopify/polaris/dist/styles.css'

import Head from 'next/head'
import { Frame, Layout, Page, Spinner } from '@shopify/polaris'
import { TitleBar, useRoutePropagation } from '@shopify/app-bridge-react'
import { Props as TitleBarProps } from '@shopify/app-bridge-react/components/TitleBar'
import ShopifyAdminNav from 'client/components/nav/shopify-admin-nav'
import { useRouter } from 'next/router'

type ShopifyAdminLayoutProps = TitleBarProps & { navHidden?: boolean; isLoading?: boolean }

const ShopifyAdminLayout: React.FC<ShopifyAdminLayoutProps> = ({
  children,
  title,
  navHidden,
  isLoading,
  ...titleBarProps
}) => {
  const { pathname } = useRouter()
  useRoutePropagation(pathname)

  return (
    <Frame navigation={navHidden ? undefined : <ShopifyAdminNav />}>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <title>
          {title}
          {' · ModaMatch'}
        </title>
      </Head>

      <TitleBar title={title} {...titleBarProps} />
      <Page>
        <Layout>
          <Layout.Section>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                <Spinner accessibilityLabel="Loading" size="large" color="inkLightest" />
              </div>
            ) : (
              children
            )}
          </Layout.Section>
        </Layout>
      </Page>

      <style jsx global>{`
        // code textstyle doesn't allow selection by default
        .Polaris-TextStyle--variationCode::after {
          content: none;
        }
      `}</style>
    </Frame>
  )
}

export default ShopifyAdminLayout
