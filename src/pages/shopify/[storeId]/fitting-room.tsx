import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Router, { useRouter } from 'next/router'
import qs from 'qs'
import querystring from 'querystring'
import { fetcher } from 'client/utils/swr-fetcher'
import { contentfulService } from 'server/services'
import { replaceAtIndex } from 'utils/general-utils'
import { findProductOptions, buildSelectedOptions } from 'utils/product-utils'

// Types
import { Entry, EntryCollection } from 'contentful'
import { Store, Category, Model } from 'types/contenful.types'
import { HydratedProduct, FittingItem, GetTryOnItemsResponse } from 'types/modamatch.types'

// Hooks
import { useMemo, useEffect, useState, useCallback } from 'react'
import useSWR, { useSWRInfinite } from 'swr'
import { useCustomerSettings } from 'client/hooks/use-customer-settings'
import { useInfiniteScroll } from 'client/hooks/use-infinite-scroll'
import { ITEMS_PER_PAGE, TRY_ON_ITEMS_LIMIT } from 'server/config/pagination'

// Components
import { IntlProvider } from 'react-intl'
import { Row, Col } from 'react-bootstrap'
import IFrameLayout from 'client/layouts/iframe-layout'
import { ProductListSidebar, ModelView } from 'client/components/fitting-room-tab'
import ProductView from 'client/components/product-view/product-view'
import Error404Page from 'pages/404'
import useAnalytics from 'client/hooks/use-analytics.service'

type FittingRoomProps = {
  store?: Store
  categories?: EntryCollection<Category>
  models?: EntryCollection<Model>
}

const FittingRoom: NextPage<FittingRoomProps> = ({ store, categories, models }) => {
  const { event } = useAnalytics()
  const { pathname } = useRouter()
  const storeType = pathname.split('/')[1]

  // state - customer
  const {
    fittingItems,
    model,
    removeFromFittingItems,
    toggleFittingItem,
    updateFittingItem,
    isOnFittingItems,
    addToCartItems,
    isOnCartItems
  } = useCustomerSettings()

  // state - current category
  const [categoryId, setCategoryId] = useState<string>('')

  // state - current model
  const currentModel = model !== undefined && model !== null ? models?.items[model] : undefined

  // state - fetch fittingItem's product details
  const { data: productsData, error: productsError, size, setSize } = useSWRInfinite<{ products: HydratedProduct[] }>(
    (index) =>
      `/api/products?${querystring.encode({
        ids: fittingItems.map(({ productId }) => productId),
        shopName: store?.storeId,
        categoryId,
        page: index,
        limit: TRY_ON_ITEMS_LIMIT
      })}`,
    fetcher
  )

  // state - fetch fittingItem's try on items
  const { data: tryOnItemsData, error: tryOnItemsError } = useSWR<GetTryOnItemsResponse>(
    `/api/contentful/try-on-items?${qs.stringify({
      storeId: store?.storeId ?? 'invalid',
      modelId: currentModel?.sys.id ?? 'invalid',
      items: fittingItems?.map(({ productId, contentfulId }) => ({
        productId,
        contentfulId
      }))
    })}`,
    fetcher
  )

  // state - store hydrated fitting items to avoid flash of tryOnItems
  const [hydratedFittingItems, setHydratedFittingItems] = useState<FittingItem[]>([])
  useEffect(() => {
    if (store && currentModel && fittingItems && productsData && tryOnItemsData) {
      setHydratedFittingItems(() =>
        fittingItems.map((fittingItem) => {
          // get normalized fetch data
          const newProducts = productsData?.map((page) => page.products).flat() ?? []
          const newTryOnItems = tryOnItemsData?.items ?? []

          // get current fitting item's product and try on items data
          const fullProduct =
            newProducts.find((product) => product?.id === fittingItem.productId) ?? fittingItem.fullProduct
          const { allTryOnItems, allTryOnItemSizes } =
            newTryOnItems.find(({ productId }) => productId === fittingItem.productId) ?? {}

          // find product options that fit available sizes
          const productOptions = findProductOptions(fullProduct)
          if (productOptions.size) {
            productOptions.size.values = productOptions.size.values.filter((value) =>
              allTryOnItemSizes?.includes(value)
            )
          }

          // get initial selected options
          const selectedOptions = fittingItem.selectedOptions ?? buildSelectedOptions(productOptions)

          // find selected try on item based on above
          const selectedTryOnItem = allTryOnItems?.find((tryOnItem) => {
            const isSameSize = tryOnItem.fields.size?.fields.name === selectedOptions?.size // 'M' === 'M'
            return selectedOptions ? isSameSize : false
          })

          // get results
          const updatedFittingItem: FittingItem = {
            ...fittingItem,
            productOptions,
            selectedOptions,
            selectedTryOnItem,
            fullProduct
          }

          // return
          return updatedFittingItem
        })
      )
    }
  }, [store, currentModel, fittingItems, productsData, tryOnItemsData])

  // state - shown product
  const [shownProductId, setShownProductId] = useState('')
  const shownFittingItem = useMemo(() => hydratedFittingItems.find(({ productId }) => productId === shownProductId), [
    hydratedFittingItems,
    shownProductId
  ])
  useEffect(() => {
    setShownProductId((prevProductId) =>
      hydratedFittingItems.find(({ productId }) => productId === prevProductId) ? prevProductId : ''
    )
  }, [hydratedFittingItems])

  // state - selected product
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const selectedFittingItems = useMemo(
    () => hydratedFittingItems.filter(({ productId }) => selectedProductIds.includes(productId)),
    [hydratedFittingItems, selectedProductIds]
  )
  useEffect(() => {
    setSelectedProductIds((prevProductIds) =>
      prevProductIds.filter((prevProductId) =>
        hydratedFittingItems.find(({ productId }) => productId === prevProductId)
      )
    )
  }, [hydratedFittingItems])

  // handler - select product id
  const handleSelectProductId = useCallback(
    (selectedProductId: string) => {
      setSelectedProductIds((prevProductIds) => {
        // get selected fitting item
        const selectedFittingItem = hydratedFittingItems.find(({ productId }) => productId === selectedProductId)

        // flags - attributes of selected product
        const isSelectedSizeSmaller =
          selectedFittingItem?.selectedTryOnItem?.fields.size && currentModel?.fields.size
            ? selectedFittingItem?.selectedTryOnItem?.fields.size?.fields.value <
              currentModel?.fields.size?.fields.value
            : false
        const isSelectedMissingTryOnItem = !selectedFittingItem?.selectedTryOnItem
        const isOnePieceTypeOfClothing =
          selectedFittingItem?.fullProduct.contentful?.fields.category.fields.typeOfClothing === 4

        // find if there exists same product
        const foundSameProductIndex = prevProductIds.findIndex((prevProductId) => prevProductId === selectedProductId)

        // find if there exists same category in selected list
        const foundSameCategoryIndex = prevProductIds.findIndex((prevProductId) => {
          const prevCategoryId = hydratedFittingItems.find(({ productId }) => productId === prevProductId)
            ?.contentfulCategoryId
          return prevCategoryId === selectedFittingItem?.contentfulCategoryId
        })

        // find if there exists same type of clothing in selected list
        const foundSameTypeOfClothing = prevProductIds.findIndex((prevProductId) => {
          // find clothing type of previous selected items
          const prevTypeOfClothing = hydratedFittingItems.find(({ productId }) => productId === prevProductId)
            ?.fullProduct.contentful?.fields.category.fields.typeOfClothing
          // previous item has same clothing type
          return (
            prevTypeOfClothing === selectedFittingItem?.fullProduct.contentful?.fields.category.fields.typeOfClothing
          )
        })

        // find if there exists one piece clothing in selected list
        const foundOnePieceClothing = prevProductIds.findIndex((prevProductId) => {
          // find clothing type of previous selected items
          const prevTypeOfClothing = hydratedFittingItems.find(({ productId }) => productId === prevProductId)
            ?.fullProduct.contentful?.fields.category.fields.typeOfClothing
          // previous item is a one piece type
          return prevTypeOfClothing === 4
        })

        // if fitting item does not have a contentful try on item, do nothing & show item
        if (isSelectedMissingTryOnItem) {
          setShownProductId(selectedProductId)
          return prevProductIds
        }

        // if fitting item size is too small for the model, do nothing & show item
        if (isSelectedSizeSmaller) {
          setShownProductId(selectedProductId)
          return prevProductIds
        }

        // if variant id is found in previous selected ids, remove from selection array & unshow item
        if (foundSameProductIndex !== -1) {
          setShownProductId('')
          return replaceAtIndex(prevProductIds, foundSameProductIndex)
        }

        // if variant category id found in previous selected ids, replace in selection array & show item
        if (foundSameCategoryIndex !== -1) {
          setShownProductId(selectedProductId)
          return replaceAtIndex(prevProductIds, foundSameCategoryIndex, selectedProductId)
        }

        // if variant category clothing type found in previous selected ids, replace in selection array & show item
        if (foundSameTypeOfClothing !== -1) {
          setShownProductId(selectedProductId)
          return replaceAtIndex(prevProductIds, foundSameTypeOfClothing, selectedProductId)
        }

        // if one piece (only - no mix) was in items before, remove from array for new tryOnItems
        if (foundOnePieceClothing !== -1) {
          setShownProductId(selectedProductId)
          return [selectedProductId]
        }

        // if variant is a one piece, no layer item, remove rest of try on items and show that one
        if (isOnePieceTypeOfClothing) { 
          setShownProductId(selectedProductId)
          return [selectedProductId]
        }

        // else, add to selection array & show item
        setShownProductId(selectedProductId)
        return [...prevProductIds, selectedProductId]
      })
    },
    [hydratedFittingItems, currentModel]
  )

  // flags - current fitting item categories
  const visibleCategories = useMemo(
    () =>
      hydratedFittingItems.reduce<Entry<Category>[]>((accum, fittingItem) => {
        const categoryObj = categories?.items.find((c) => c.sys.id === fittingItem.contentfulCategoryId)
        if (!categoryObj || accum.includes(categoryObj)) {
          return accum
        }
        return [...accum, categoryObj]
      }, []),
    [hydratedFittingItems, categories]
  )

  // flags - product view
  const isShownSizeSmaller = useMemo(
    () =>
      shownFittingItem?.selectedTryOnItem?.fields.size && currentModel?.fields.size
        ? shownFittingItem?.selectedTryOnItem?.fields.size?.fields.value < currentModel?.fields.size?.fields.value
        : false,
    [shownFittingItem, currentModel]
  )
  const isShownMissingTryOnItem = useMemo(() => !shownFittingItem?.selectedTryOnItem, [shownFittingItem])
  const isShownOnFittingItems = useMemo(() => !!isOnFittingItems(shownProductId), [shownProductId, isOnFittingItems])

  // flags - loading
  const isModelLoading = !currentModel
  const isProductsLoading = !productsData && !productsError
  const isTryOnClothsLoading = !tryOnItemsData && !tryOnItemsError
  const isReachingEnd = !productsData || productsData[productsData.length - 1]?.products?.length < ITEMS_PER_PAGE
  const hasMore = !isReachingEnd && !isProductsLoading
  const isListLoading =
    isProductsLoading || !!(size > 0 && productsData && typeof productsData[size - 1] === 'undefined' && hasMore)
  const [loaderRef] = useInfiniteScroll(hasMore, isListLoading, setSize)
  const isLoading = isModelLoading || isListLoading || isTryOnClothsLoading

  // routing - force model selection if none has been selected yet
  useEffect(() => {
    if (model === undefined) {
      Router.replace(`/${storeType}/${store?.storeId}/choose-model`)
    } else {
      event({
        category: 'Fitting',
        action: 'Viewed',
        value: fittingItems.length
      })
    }
  }, [event, fittingItems, model, store, storeType])

  // routing - 404 if store doesn't exist
  if (!store) {
    return <Error404Page />
  }

  return (
    // Uncomment for French
    // <IntlProvider messages={messagesInFrench} defaultLocale="en" locale="fr" >
    <IntlProvider defaultLocale="en" locale="en">
      <IFrameLayout title="Fitting Room" store={store} hasSidebar>
        <ProductListSidebar
          fittingItems={hydratedFittingItems}
          selectedProductIds={selectedProductIds}
          onSelectProductId={handleSelectProductId}
          visibleCategories={visibleCategories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          isLoading={isListLoading}
          loaderRef={loaderRef}
        />
        <Row className="h-100">
          <Col sm={6} className="h-100">
            <ModelView
              store={store}
              currentModel={currentModel}
              selectedFittingItems={selectedFittingItems}
              visibleCategories={visibleCategories}
              isLoading={isModelLoading}
            />
          </Col>
          <Col sm={6} className="h-100 mt-4 mt-sm-0">
            {shownFittingItem && (
              <ProductView
                store={store}
                currentModel={currentModel}
                product={shownFittingItem.fullProduct}
                showColumnView
                productOptions={shownFittingItem.productOptions}
                selectedOptions={shownFittingItem.selectedOptions}
                isLoading={isLoading}
                isShownSizeSmaller={isShownSizeSmaller}
                isShownMissingTryOnItem={isShownMissingTryOnItem}
                isShownOnFittingItems={isShownOnFittingItems}
                updateFittingItem={updateFittingItem}
                removeFromFittingItems={removeFromFittingItems}
                toggleFittingItem={toggleFittingItem}
                addToCartItems={addToCartItems}
                isOnCartItems={isOnCartItems}
              />
            )}
          </Col>
        </Row>
      </IFrameLayout>
    </IntlProvider>
  )
}

export default FittingRoom

export const getStaticPaths: GetStaticPaths = async () => {
  const { items: stores } = await contentfulService.getStoreList({ enabled: true })

  return {
    paths: stores.map((entry) => ({ params: { storeId: entry.fields.storeId } })),
    fallback: true
  }
}

export const getStaticProps: GetStaticProps<FittingRoomProps> = async ({ params }) => {
  const store = await contentfulService.getStoreByStoreName(params?.storeId as string)
  const categories = await contentfulService.getCategoryList(params?.storeId as string)
  const models = await contentfulService.getModelList(params?.storeId as string)
  return { props: { store: store?.fields, categories, models }, revalidate: 60, notFound: !store }
}
