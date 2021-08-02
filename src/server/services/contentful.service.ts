import * as contentful from 'contentful'
import { Model, Store, Category, Item, TryOnItem } from 'types/contenful.types'
import { GetTryOnItemsRequest, GetTryOnItemsResponse } from 'types/modamatch.types'
import { uniqueBy } from 'utils/general-utils'
import { contentfulService } from '.'

const { CONTENTFUL_SPACE_ID = '', CONTENTFUL_ACCESS_TOKEN = '', CONTENTFUL_ENVIRONMENT } = process.env

export const contentfulClient = contentful.createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_ACCESS_TOKEN,
  environment: CONTENTFUL_ENVIRONMENT
})

export const getStoreList = (filter: { enabled?: boolean } = {}) =>
  contentfulClient.getEntries<Store>({
    content_type: 'store',
    ...(filter.enabled !== undefined && {
      'fields.enabled': filter.enabled
    })
  })

export const getStoreByStoreName = (storeId: string, onlyEnabled = true) =>
  contentfulClient
    .getEntries<Store>({
      content_type: 'store',
      'fields.storeId': storeId,
      'fields.enabled': onlyEnabled
    })
    .then(({ items }) => (items.length ? items[0] : undefined))

export const getStoreById = async (id: string) => contentfulClient.getEntry<Store>(id)

export const getItemListByCategory = (categoryId: string, query: { limit?: number; skip?: number } = {}) =>
  contentfulClient.getEntries<Item>({
    content_type: 'item',
    'fields.category.sys.contentType.sys.id': 'category',
    'fields.category.sys.id': categoryId,
    ...query
  })

export const getItemListByStore = (storeId: string, query: { limit?: number; skip?: number } = {}) =>
  contentfulClient.getEntries<Item>({
    content_type: 'item',
    'fields.store.sys.contentType.sys.id': 'store',
    'fields.store.fields.storeId': storeId,
    ...query
  })

export const getItemByShopifyId = (shopifyId: string) =>
  contentfulClient
    .getEntries<Item>({
      content_type: 'item',
      'fields.shopifyId': shopifyId
    })
    .then(({ items }) => (items.length ? items[0] : undefined))

export const getItemById = (id: string) => contentfulService.getEntry<Item>(id)

export const getCategoryList = (storeId: string) =>
  contentfulClient.getEntries<Category>({
    content_type: 'category',
    'fields.store.sys.contentType.sys.id': 'store',
    'fields.store.fields.storeId': storeId
  })

export const getCategoryById = (id: string) => contentfulClient.getEntry<Category>(id)

export const getEntry: typeof contentfulClient.getEntry = (id, query) => contentfulClient.getEntry(id, query)

export const getModelList = (storeId: string) =>
  contentfulClient.getEntries<Model>({
    content_type: 'model',
    order: 'sys.id',
    'fields.store.sys.contentType.sys.id': 'store',
    'fields.store.fields.storeId': storeId
  })

export const getModelById = (id: string) => contentfulClient.getEntry<Model>(id)

export const getTryOnItems = async (
  storeId: string,
  modelId: string,
  items?: GetTryOnItemsRequest['items']
): Promise<GetTryOnItemsResponse['items']> => {
  if (!items) return []

  // get contentful item by product's contentful id
  const rawTryOnItems = (
    await contentfulClient.getEntries<TryOnItem>({
      include: 5, // nested levels
      content_type: 'tryOnItem',
      'fields.model.sys.id': modelId,
      'fields.item.sys.id[in]': items.map(({ contentfulId }) => contentfulId).join(',')
    })
  ).items

  // get tryonitem based on currently selected options
  const resultItems: GetTryOnItemsResponse['items'] = items.map(({ productId, contentfulId }) => {
    // get tryOnItems for current product and store
    const allTryOnItems = rawTryOnItems.filter((tryOnItem) => {
      const isSameStore = tryOnItem.fields.item.fields.store.fields.storeId === storeId
      const isSameProduct = tryOnItem.fields.item.sys.id === contentfulId
      return isSameStore && isSameProduct
    })

    const availableSizes =
      allTryOnItems
        .filter((tryOnItem) => {
          const hasValidSize = tryOnItem.fields.size?.fields.name !== undefined
          return hasValidSize
        })
        .sort((a, b) => (a.fields.size?.fields.value ?? 0) - (b.fields.size?.fields.value ?? 0))
        .map(({ fields }) => fields.size?.fields.name ?? '') ?? []
    const allTryOnItemSizes = uniqueBy(availableSizes, (TryOnItemSize) => `${TryOnItemSize}`)

    // return
    const selectedItem = {
      productId,
      contentfulId,
      allTryOnItems,
      allTryOnItemSizes
    }

    return selectedItem
  })

  return resultItems
}
