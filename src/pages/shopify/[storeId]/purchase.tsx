import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import cn from 'classnames'
import { IntlProvider } from 'react-intl'
import { contentfulService } from 'server/services'
import { Store } from 'types/contenful.types'
import React, { useCallback, useEffect, useState } from 'react'

import { Row } from 'react-bootstrap'
import { CheckoutTable, CartTotal } from 'client/components/purchase-tab'

import Error404Page from 'pages/404'
import IFrameLayout from 'client/layouts/iframe-layout'

// Hooks
import { useCustomerSettings } from 'client/hooks/use-customer-settings'

import { useShopifyEmbed } from 'client/hooks/use-shopify-embed.hook'
import { SHOPIFY_MESSAGE_TYPE } from 'types/shopify-embed.types'
import useAnalytics from 'client/hooks/use-analytics.service'
import styles from './purchase.module.scss'

type ShopifyPageProps = {
  store?: Store
}

// Translated messages in French with matching IDs to what you declared
const messagesInFrench = {
  addToCart: 'Ajouter au chariot'
}

const Purchase: NextPage<ShopifyPageProps> = ({ store }) => {
  const { cartItems, removeFromCartItems, updateCartItem } = useCustomerSettings()
  const { event } = useAnalytics()
  const { postMessage } = useShopifyEmbed()
  const errorDefault = {
    state: false,
    message: '',
    description: ''
  }

  const [isSending, setSending] = useState(false)
  const [error, setError] = useState(errorDefault)

  const loadingAnimation = () => {
    setTimeout(() => {
      setSending(false)
    }, 500)
  }

  const showError = (err: any) => {
    setError({
      state: true,
      message: err.description,
      description: err.description || err.message
    })
    setTimeout(() => {
      setError(errorDefault)
    }, 3000)
  }

  const addItemToCart = useCallback(async () => {
    const items = cartItems.map((item: any) => ({ id: item.variantId, quantity: item.qty }))
    await postMessage(SHOPIFY_MESSAGE_TYPE.ADD_CART, {
      items
    })
  }, [postMessage, cartItems])

  const proceedToCart = async () => {
    setSending(true)

    try {
      await addItemToCart()
      loadingAnimation()
      postMessage(SHOPIFY_MESSAGE_TYPE.CHECKOUT_CART)
    } catch (err) {
      loadingAnimation()
      showError(err)
    }

    const sum = cartItems?.reduce((total: any, currVal: any) => total + (currVal.price ?? 0), 0)
    event({
      category: 'Checkout',
      action: 'Selected',
      value: sum
    })
  }

  useEffect(() => {
    const sum = cartItems?.reduce((total: any, currVal: any) => total + (currVal.price ?? 0), 0)
    event({
      category: 'Cart',
      action: 'Viewed',
      value: sum
    })
  }, [cartItems, event])

  if (!store) {
    return <Error404Page />
  }
  return (
    // Uncomment for French
    // <IntlProvider messages={messagesInFrench} defaultLocale="en" locale="fr" >
    <IntlProvider defaultLocale="en" locale="en">
      <IFrameLayout title="Checkout Tab" store={store}>
        <Row className={cn(styles.purchaseContainer, 'h-100')}>
          <CheckoutTable
            store={store}
            cartItems={cartItems}
            removeFromCartItems={removeFromCartItems}
            updateCartItem={updateCartItem}
          />
          <CartTotal cartItems={cartItems} proceedToCart={proceedToCart} isSending={isSending} error={error} />
        </Row>
      </IFrameLayout>
    </IntlProvider>
  )
}

export default Purchase

export const getStaticPaths: GetStaticPaths = async () => {
  const { items: stores } = await contentfulService.getStoreList({ enabled: true })

  return {
    paths: stores.map((entry) => ({ params: { storeId: entry.fields.storeId } })),
    fallback: true
  }
}

export const getStaticProps: GetStaticProps<ShopifyPageProps> = async ({ params }) => {
  const store = await contentfulService.getStoreByStoreName(params?.storeId as string)
  const categories = await contentfulService.getCategoryList(params?.storeId as string)

  return { props: { store: store?.fields, categories }, revalidate: 60, notFound: !store }
}
