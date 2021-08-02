import { Product } from 'server/models/product'
import { Item } from 'types/contenful.types'
import { HydratedProduct } from 'types/modamatch.types'
import { contentfulService } from '.'
import { contentfulClient } from './contentful.service'

export const getProductList = async (
  shopName: string,
  options?: {
    ids?: string[]
    categoryId?: string
    priceRange?: number[]
    sortBy?: string
    skip?: number
    limit?: number
  }
): Promise<HydratedProduct[]> => {
  // first we get a list of products from our database
  const products = await Product.find({
    enabled: true,
    shopName,
    ...(options?.categoryId && { contentfulCategoryId: options?.categoryId }),
    ...(options?.ids && { _id: { $in: options.ids } }),
    ...(options?.priceRange && {
      price: {
        $gte: options.priceRange[0],
        // only set less than if it's greater than 0
        ...(options.priceRange[1] && { $lte: options.priceRange[1] })
      }
    })
  })
    // must add _id into sort, else items of same price will return randomly,
    // and thus be randomly excluded / included in start and end of pagination's array
    .sort({ price: options?.sortBy === 'price-desc' ? 'desc' : 'asc', _id: 'asc' })
    .skip(options?.skip ?? 0)
    .limit(options?.limit ?? 100)

  // then we merge that info with data from contentful
  const contentfulProducts = await contentfulClient.getEntries<Item>({
    content_type: 'item',
    'sys.id[in]': products
      .filter(({ contentfulId }) => contentfulId)
      .map(({ contentfulId }) => `${contentfulId}`)
      .join(',')
  })

  return products.map((product) => ({
    ...product.toJSON(),
    id: product._id as string,
    contentful: contentfulProducts.items.find((contentfulProduct) => contentfulProduct.sys.id === product.contentfulId)
  }))
}

export const countProducts = async (shopName: string, options: { categoryId: string; priceRange?: number[] }) =>
  Product.find({
    enabled: true,
    shopName,
    contentfulCategoryId: options.categoryId,
    ...(options?.priceRange && {
      price: {
        $gte: options.priceRange[0],
        // only set less than if it's greater than 0
        ...(options.priceRange[1] && { $lte: options.priceRange[1] })
      }
    })
  }).countDocuments()

export const getProduct = async (productId: string): Promise<HydratedProduct | undefined> => {
  // get product from our database
  const product = await Product.findById(productId)
  if (!product) {
    return undefined
  }

  // merge it with info from contentful
  const productContentful = product.contentfulId ? await contentfulService.getItemById(product.contentfulId) : undefined

  return {
    ...product.toJSON(),
    id: product.id,
    contentful: productContentful
  }
}
