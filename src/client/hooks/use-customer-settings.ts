// import querystring from 'querystring'
// import axios from 'axios'
// import { fetcher } from 'client/utils/swr-fetcher'
import { uniqueBy, replaceAtIndex } from 'utils/general-utils'
import { buildFittingItem, buildCartItem } from 'utils/product-utils'

// types
// import { CustomerPreferenceType } from 'server/models/customer-preference'
import { HydratedProduct, CartItem, FittingItem, SelectedOptions } from 'types/modamatch.types'

// hooks
import { useCallback, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/router'
// import { captureRejectionSymbol } from 'events'
// import { useShopifyEmbed } from './use-shopify-embed.hook'

export const CustomerSettingsContext = createContext<{
  model?: any
  setModel?: any
  fittingItems?: FittingItem[]
  setFittingItems?: any
  cartItems?: any
  setCartItems?: any
}>({})

export const useCustomerSettings = () => {
  // const { customer } = useShopifyEmbed()
  const { query } = useRouter()
  const storeId = query.storeId as string | undefined

  const { model, setModel, fittingItems = [], setFittingItems, cartItems, setCartItems } = useContext(
    CustomerSettingsContext
  )

  // load initial list and settings
  useEffect(() => {
    if (!storeId) {
      return
    }

    setFittingItems(JSON.parse(localStorage.getItem(`${storeId}-fittingItems`) ?? '[]'))
    setCartItems(JSON.parse(localStorage.getItem(`${storeId}-cartItems`) ?? '[]'))

    // if (customer && !customer.email) {
    const savedModel = localStorage.getItem('model')
    setModel(savedModel ? Number(savedModel) : undefined)
    // }
    /* if (customer && customer.email) {
      fetcher(`/api/customer/preferences?${querystring.encode({ email: customer.email })}`)
        .then((preferences: CustomerPreferenceType) => {
          setModel(preferences.model)
        })
        .catch(() => [])
    } */
  }, [setFittingItems, setCartItems, setModel, storeId])

  // useEffect(() => {
  //   sessionStorage.setItem(`${storeId}-fittingItems`, JSON.stringify(fittingItems))
  //   sessionStorage.setItem(`${storeId}-cartItems`, JSON.stringify(cartItems))
  //   // if (customer && !customer.email) {
  //   localStorage.setItem('model', model?.toString() ?? '')
  //   // }
  //   /* if (customer && customer.email) {
  //     axios.post(`/api/customer/preferences?${querystring.encode({ email: customer.email })}`, {
  //       model
  //     })
  //   } */
  // }, [fittingItems, cartItems, model, storeId])

  // save changes to the list to either localstorage or our api
  // useEffect(() => {
  // localStorage.setItem(`${storeId}-fittingItems`, JSON.stringify(fittingItems))
  // localStorage.setItem(`${storeId}-cartItems`, JSON.stringify(cartItems))
  // if (customer && !customer.email) {
  // localStorage.setItem('model', model?.toString() ?? '')
  // }
  /* if (customer && customer.email) {
      axios.post(`/api/customer/preferences?${querystring.encode({ email: customer.email })}`, {
        model
      })
    } */
  // }, [fittingItems, cartItems, model, storeId])

  // try on list actions
  const findFittingItem = useCallback(
    (productId: string) => {
      const foundIndex = fittingItems.findIndex((fittingItem) => fittingItem.productId === productId)
      return { foundFittingItem: fittingItems[foundIndex], foundIndex }
    },
    [fittingItems]
  )

  const updateFittingItem = useCallback(
    (productId: string, partialFittingItem: Partial<FittingItem>) => {
      const { foundFittingItem, foundIndex } = findFittingItem(productId)
      if (foundFittingItem) {
        setFittingItems((prevFittingItems: any) => {
          const mergedFittingItem = {
            ...foundFittingItem,
            ...partialFittingItem
          }
          const newFittingItems = replaceAtIndex(prevFittingItems, foundIndex, mergedFittingItem)
          const uniqueFittingItems = uniqueBy(newFittingItems, (fittingItem) => `${fittingItem.productId}`)
          localStorage.setItem(`${storeId}-fittingItems`, JSON.stringify(uniqueFittingItems))
          return uniqueFittingItems
        })
      }
    },
    [findFittingItem, setFittingItems, storeId]
  )

  const addToFittingItems = useCallback(
    (product: HydratedProduct, selectedOptions?: SelectedOptions) => {
      const newFittingItem = buildFittingItem(product, selectedOptions)
      const { foundFittingItem } = findFittingItem(product.id)
      if (foundFittingItem) {
        updateFittingItem(product.id, { selectedOptions })
      } else {
        setFittingItems((prevFittingItems: any) => {
          const newFittingItems = [...prevFittingItems, newFittingItem]
          localStorage.setItem(`${storeId}-fittingItems`, JSON.stringify(newFittingItems))
          return newFittingItems
        })
      }
    },
    [findFittingItem, updateFittingItem, setFittingItems, storeId]
  )

  const removeFromFittingItems = useCallback(
    (productId: string) => {
      setFittingItems((prevFittingItems: any) => {
        const newFittingItems = prevFittingItems.filter((fittingItem: any) => fittingItem.productId !== productId)
        localStorage.setItem(`${storeId}-fittingItems`, JSON.stringify(newFittingItems))
        return newFittingItems
      })
    },
    [setFittingItems, storeId]
  )

  const toggleFittingItem = useCallback(
    (product: HydratedProduct, selectedOptions?: SelectedOptions) => {
      const { foundFittingItem } = findFittingItem(product.id)
      if (foundFittingItem) {
        removeFromFittingItems(product.id)
      } else {
        addToFittingItems(product, selectedOptions)
      }
    },
    [findFittingItem, addToFittingItems, removeFromFittingItems]
  )

  const clearFittingItemsOptions = useCallback(() => {
    setFittingItems((prevFittingItems: any) => {
      const newFittingItems = prevFittingItems.map(
        ({ productOptions, selectedOptions, ...fittingItem }: any) => fittingItem
      )
      localStorage.setItem(`${storeId}-fittingItems`, JSON.stringify(newFittingItems))
      return newFittingItems
    })
  }, [setFittingItems, storeId])

  const isOnFittingItems = useCallback(
    (productId: string) => {
      const { foundFittingItem } = findFittingItem(productId)
      return !!foundFittingItem
    },
    [findFittingItem]
  )

  // cart list actions
  const findCartItem = useCallback(
    (variantId: number) => {
      const index = cartItems.findIndex((cartItem: any) => cartItem.variantId === variantId)
      return { foundCartItem: cartItems[index], foundIndex: index }
    },
    [cartItems]
  )

  const productIdBasedFindCartItem = useCallback(
    (productId: string | undefined, variantId: number) => {
      const index = cartItems.findIndex(
        (cartItem: any) => cartItem.productId === productId && cartItem.variantId === variantId
      )
      return { foundCartItem: cartItems[index], foundIndex: index }
    },
    [cartItems]
  )

  const updateCartItem = useCallback(
    (variantId: number, partialCartItem: Partial<CartItem>) => {
      const { foundCartItem, foundIndex } = productIdBasedFindCartItem(
        partialCartItem.productId,
        partialCartItem.variantId || variantId
      )
      if (foundCartItem) {
        setCartItems((prevCartItems: any) => {
          const mergedCartItem = {
            ...foundCartItem,
            ...partialCartItem
          }
          const newCartItems = replaceAtIndex(prevCartItems, foundIndex, mergedCartItem)
          const uniqueCartItems = uniqueBy(
            newCartItems,
            (fittingItem) => `${fittingItem.productId}-${fittingItem.variantId}`
          )
          localStorage.setItem(`${storeId}-cartItems`, JSON.stringify(uniqueCartItems))
          return uniqueCartItems
        })
      }
    },
    [productIdBasedFindCartItem, setCartItems, storeId]
  )

  const addToCartItems = useCallback(
    (product: HydratedProduct, selectedOptions?: SelectedOptions) => {
      const newCartItem = buildCartItem(product, selectedOptions)
      const { foundCartItem } = productIdBasedFindCartItem(newCartItem.productId, newCartItem.variantId)
      if (foundCartItem) {
        updateCartItem(newCartItem.variantId, { selectedOptions, qty: foundCartItem.qty + 1 })
      } else {
        setCartItems((prevCartItems: any) => {
          const newCartItems = [...prevCartItems, newCartItem]
          localStorage.setItem(`${storeId}-cartItems`, JSON.stringify(newCartItems))
          return newCartItems
        })
      }
    },
    [productIdBasedFindCartItem, updateCartItem, setCartItems, storeId]
  )

  const removeFromCartItems = useCallback(
    (productId: string | undefined, variantId: number) => {
      setCartItems((prevCartItems: any) => {
        const newCartItems = prevCartItems.filter((cartItem: any) => {
          return cartItem.productId !== productId || cartItem.variantId !== variantId
        })
        localStorage.setItem(`${storeId}-cartItems`, JSON.stringify(newCartItems))
        return newCartItems
      })
    },
    [setCartItems, storeId]
  )

  const isOnCartItems = useCallback(
    (product: HydratedProduct, selectedOptions?: SelectedOptions) => {
      const newCartItem = buildCartItem(product, selectedOptions)
      const { foundCartItem } = productIdBasedFindCartItem(product.id, newCartItem.variantId)
      return foundCartItem && foundCartItem.productId === product.id
    },
    [productIdBasedFindCartItem]
  )

  // return
  return {
    model,
    setModel,
    fittingItems,
    setFittingItems,
    findFittingItem,
    addToFittingItems,
    removeFromFittingItems,
    toggleFittingItem,
    updateFittingItem,
    clearFittingItemsOptions,
    isOnFittingItems,
    cartItems,
    findCartItem,
    setCartItems,
    addToCartItems,
    removeFromCartItems,
    updateCartItem,
    isOnCartItems
  }
}
