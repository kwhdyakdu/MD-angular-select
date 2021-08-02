import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { IntlProvider } from 'react-intl'
import { contentfulService, productService } from 'server/services'

// Types
import { Entry } from 'contentful'
import { Store, Category } from 'types/contenful.types'
import { HydratedProduct } from 'types/modamatch.types'

// Components
import Error404Page from 'pages/404'
import IFrameLayout from 'client/layouts/iframe-layout'
import ProductView from 'client/components/product-view/product-view'

// Hooks
import { useEffect, useMemo } from 'react'
import { useCustomerSettings } from 'client/hooks/use-customer-settings'

import { connectToDatabase } from 'server/middlewares/connect-to-database'
import useAnalytics from 'client/hooks/use-analytics.service'

type ShopifyProductPageProps = {
  store?: Store
  product?: HydratedProduct
  category?: Entry<Category>
}

const ShopifyProductPage: NextPage<ShopifyProductPageProps> = ({ store, product, category }) => {
  const { isOnFittingItems, toggleFittingItem } = useCustomerSettings()
  const { event } = useAnalytics()

  const isShownOnFittingItems = useMemo(() => !!product && !!isOnFittingItems(product.id), [product, isOnFittingItems])

  useEffect(() => {
    if (product) {
      event({
        category: 'Product',
        action: 'Viewed',
        label: product.title ?? product.id
      })
    }
  }, [event, product])

  if (!store || !product) {
    return <Error404Page />
  }

  return (
    <IntlProvider defaultLocale="en" locale="en">
      <IFrameLayout title="Product View - Shopify" store={store}>
        <ProductView
          store={store}
          category={category?.fields}
          product={product}
          isShownOnFittingItems={isShownOnFittingItems}
          toggleFittingItem={toggleFittingItem}
        />
      </IFrameLayout>
    </IntlProvider>
  )
}

export default ShopifyProductPage

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps<ShopifyProductPageProps> = async ({ params }) => {
  await connectToDatabase()

  const store = await contentfulService.getStoreByStoreName(params?.storeId as string)
  const product = await productService.getProduct(params?.productId as string)
  const category =
    product && product.contentfulCategoryId
      ? await contentfulService.getCategoryById(product.contentfulCategoryId)
      : undefined

  return { props: { store: store?.fields, product, category }, revalidate: 60, notFound: !store || !product }
}
