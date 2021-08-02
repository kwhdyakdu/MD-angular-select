import { HydratedProduct, FittingItem, CartItem, ProductOptions, SelectedOptions } from 'types/modamatch.types'

export const findProductOptions = (product: HydratedProduct): ProductOptions => ({
  size: product.shopifyData?.options.find(({ name }) => name?.toLowerCase() === 'size'),
  color: product.shopifyData?.options.find(({ name }) => name?.toLowerCase() === 'color')
})

export const buildSelectedOptions = (productOptions: ProductOptions) => {
  return {
    size: productOptions.size?.values[0],
    color: productOptions.color?.values[0]
  }
}

export const doesProductHaveVariants = (product: HydratedProduct) =>
  product.shopifyData && product.shopifyData.variants.length > 1

export const findProductVariant = (product: HydratedProduct, selectedOptions?: SelectedOptions) => {
  const productOptions = findProductOptions(product)
  const newSelectedOptions = selectedOptions ?? buildSelectedOptions(productOptions)
  const hasProductVariants = doesProductHaveVariants(product)
  // if there is only one variant, we don't search for it
  // else, find variant that matches the selected color and size or return the first one
  if (!hasProductVariants) {
    return product.shopifyData!.variants[0]
  }

  const variants = product.shopifyData?.variants || []
  for (let i = 0; i < variants.length; i += 1) {
    const variant = variants[i] as any
    const sizeOptionsKey = `option${productOptions.size?.position ?? 1}`
    const colorOptionsKey = `option${productOptions.color?.position ?? 2}`
    if (variant[sizeOptionsKey] === newSelectedOptions.size && variant[colorOptionsKey] === newSelectedOptions.color) {
      return variant
    }
  }
  return product.shopifyData!.variants[0]
}

export const buildFittingItem = (product: HydratedProduct, selectedOptions?: SelectedOptions): FittingItem => {
  const productOptions = findProductOptions(product)
  return {
    productId: product.id,
    contentfulId: product.contentfulId,
    contentfulCategoryId: product.contentfulCategoryId,
    productOptions,
    selectedOptions,
    fullProduct: product,
    selectedTryOnItem: undefined
  }
}

export const buildCartItem = (product: HydratedProduct, selectedOptions?: SelectedOptions): CartItem => {
  const productVariant = findProductVariant(product, selectedOptions)
  return {
    variantId: productVariant?.id ?? 0,
    productId: product.id,
    title: product.title,
    price: product.price,
    imageUrl: product.imageUrl,
    qty: 1,
    selectedOptions,
    fullProduct: product,
    selectedTryOnItem: undefined
  }
}
