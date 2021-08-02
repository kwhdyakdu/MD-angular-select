import { Entry } from 'contentful'
import { IProductOption } from 'shopify-api-node'
import { Item, TryOnItem } from 'types/contenful.types'
import { ProductType } from 'server/models/product'

export type HydratedProduct = ProductType & {
  id: string
  contentful?: Entry<Item>
}

// available options - size: [s, m, etc]
export type ProductOptions = {
  size: IProductOption | undefined
  color: IProductOption | undefined
}

// chosen options - size: s
export type SelectedOptions = {
  size: string | undefined
  color: string | undefined
}

export type FittingItem = {
  productId: string
  contentfulId?: string
  contentfulCategoryId?: string
  productOptions?: ProductOptions
  selectedOptions?: SelectedOptions
  selectedTryOnItem?: Entry<TryOnItem>
  fullProduct: HydratedProduct
}

export type CartItem = {
  variantId: number
  productId?: string
  title?: string
  price?: number
  imageUrl?: string
  qty: number
  selectedOptions?: SelectedOptions
  selectedTryOnItem?: Entry<TryOnItem>
  fullProduct: HydratedProduct
}

export type GetTryOnItemsRequest = {
  storeId: string
  modelId: string
  items: Array<{
    productId: string
    contentfulId: string
  }>
}

export type GetTryOnItemsResponse = {
  items: Array<{
    productId: string
    contentfulId: string
    allTryOnItems: Entry<TryOnItem>[]
    allTryOnItemSizes: string[]
  }>
}
