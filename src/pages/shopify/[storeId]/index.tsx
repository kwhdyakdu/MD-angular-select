import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import querystring from 'querystring'
import { IntlProvider } from 'react-intl'
import { contentfulService } from 'server/services'
import { ITEMS_PER_PAGE } from 'server/config/pagination'
import { fetcher } from 'client/utils/swr-fetcher'

// types
import { EntryCollection } from 'contentful'
import { Store, Category } from 'types/contenful.types'
import { HydratedProduct } from 'types/modamatch.types'

// hooks
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo } from 'react'
import { useSWRInfinite } from 'swr'
import { useInfiniteScroll } from 'client/hooks/use-infinite-scroll'

// components
import Error404Page from 'pages/404'
import IFrameLayout from 'client/layouts/iframe-layout'
import PickYourFashion from 'client/components/pick-tab/pick-your-fashion'
import PickFilter from 'client/components/pick-tab/pick-filter'

type ShopifyPageProps = {
  store?: Store
  categories?: EntryCollection<Category>
}

// Translated messages in French with matching IDs to what you declared
const messagesInFrench = {
  addToCart: 'Ajouter au chariot'
}

const ShopifyIndex: NextPage<ShopifyPageProps> = ({ store, categories }) => {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string>()
  const [filter, setFilter] = useState({})
  const [sortBy, setSortBy] = useState('price-asc')

  // products fetch
  const { data, error, size, setSize } = useSWRInfinite<{ products: HydratedProduct[] }>(
    (index) =>
      `/api/products?${querystring.encode({
        shopName: store?.storeId,
        categoryId: activeCategory ?? '',
        page: index,
        sortBy,
        ...filter
      })}`,
    fetcher
  )
  const products = useMemo((): HydratedProduct[] => (data ? data.map((page) => page.products).flat() : []), [data])
  const isLoadingInitialData = !data && !error
  const isReachingEnd = !data || data[data.length - 1]?.products?.length < ITEMS_PER_PAGE
  const hasMore = !isReachingEnd && !isLoadingInitialData
  const isLoading = hasMore || isLoadingInitialData
      console.log(products)
  // manage infinite scroll
  const isScrollLoading =
    isLoadingInitialData || !!(size > 0 && data && typeof data[size - 1] === 'undefined' && hasMore)
  const [loaderRef] = useInfiniteScroll(hasMore, isScrollLoading, setSize)

  // set active category
  useEffect(() => {
    let category: string
    if (typeof router.query.category === 'string') {
      category = router.query.category

      const categoryObj = categories?.items.find((cat) => cat.fields.category === category)
      setActiveCategory(categoryObj?.sys.id)
    }
  }, [router.query.category, categories?.items, products])

  if (!store) {
    return <Error404Page />
  }

  return (
    // Uncomment for French
    // <IntlProvider messages={messagesInFrench} defaultLocale="en" locale="fr" >
    <IntlProvider defaultLocale="en" locale="en">
      <IFrameLayout title="Pick Tab" store={store} hasSidebar>
        <PickFilter
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={categories}
          setFilter={setFilter}
          filter={filter}
          store={store}
          products={products}
        />
        <PickYourFashion
          products={products}
          isLoading={isLoading}
          loaderRef={loaderRef}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </IFrameLayout>
    </IntlProvider>
  )
}

export default ShopifyIndex

export const getStaticPaths: GetStaticPaths = async () => {
  const { items: stores } = await contentfulService.getStoreList({ enabled: true })

  return {
    paths: stores.map((entry) => ({ params: { storeId: entry.fields.storeId } })),
    fallback: true
  }
}

export const getStaticProps: GetStaticProps<ShopifyPageProps> = async ({ params }) => {
  const store = await contentfulService.getStoreByStoreName(params?.storeId as string)
  // console.log(store)
  const categories = await contentfulService.getCategoryList(params?.storeId as string)

  return { props: { store: store?.fields, categories }, revalidate: 60, notFound: !store }
}
