import cn from 'classnames'

// types
import { Store } from 'types/contenful.types'
import { HydratedProduct, SelectedOptions } from 'types/modamatch.types'

// hooks
import React, { FC, SetStateAction, Dispatch } from 'react'
// import { useRouter } from 'next/router'

// components
import { Button } from 'react-bootstrap'
import Link from 'next/link'

// styles
import useAnalytics from 'client/hooks/use-analytics.service'
import styles from './product-view.module.scss'

type TopActionButtonProps = {
  store?: Store
  product: HydratedProduct
  selectedOptions?: SelectedOptions
  shopType: String
  isSending: Boolean
  added: Boolean
  addToCartItems: (product: HydratedProduct, selectedOptions?: SelectedOptions) => void
  isOnCartItems: (product: HydratedProduct, selectedOptions?: SelectedOptions) => Boolean
  loadingAnimation: () => void
  setSending: Dispatch<SetStateAction<boolean>>
}

const TopActionButton: FC<TopActionButtonProps> = ({
  store,
  product,
  selectedOptions,
  shopType,
  isSending,
  added,
  addToCartItems,
  isOnCartItems,
  loadingAnimation,
  setSending
}) => {
  const { event } = useAnalytics()

  if (isSending) {
    return (
      <Button className={cn(styles.h3, styles.addToCartButton, 'mt-3 py-3 px-2')} variant="secondary" disabled>
        {added ? (
          <span>Added Item to Cart!</span>
        ) : (
          <div className={cn(styles.spinnerBorder, 'spinner-border')} role="status">
            <span className={styles.hidden}>Loading...</span>
          </div>
        )}
      </Button>
    )
  }

  if (isOnCartItems(product, selectedOptions)) {
    return (
      <Link href={`/${shopType}/${store?.storeId}`}>
        <Button className={cn(styles.h3, styles.addToCartButton, 'mt-3 py-3 px-2')} variant="primary">
          Keep Shopping
        </Button>
      </Link>
    )
  }

  return (
    <Button
      className={cn(styles.h3, styles.addToCartButton, 'mt-3 py-3 px-2')}
      variant="primary"
      onClick={() => {
        setSending(true)
        addToCartItems(product, selectedOptions)
        loadingAnimation()
        event({
          category: 'Product Cart',
          action: 'Added',
          label: product.title ?? product.id
        })
      }}
    >
      Add to Cart
    </Button>
  )
}

export default TopActionButton
