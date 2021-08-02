import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import { Alert, Button, Col } from 'react-bootstrap'
import { useShopifyEmbed } from 'client/hooks/use-shopify-embed.hook'
import { CartItem } from 'types/modamatch.types'
// import useAnalytics from 'client/hooks/use-analytics.service'
import styles from './cart-total.module.scss'

type CartTotalProps = {
  cartItems?: CartItem[]
  proceedToCart: () => void
  isSending: boolean
  error: {
    state: boolean
    message: string
    description: string
  }
}

const CartTotal: React.FC<CartTotalProps> = ({ cartItems, proceedToCart, isSending, error }) => {
  const { formatCurrency } = useShopifyEmbed()
  const [totalItems, setTotalItems] = useState<number>()
  const [totalPrice, setTotalPrice] = useState<number>()
  useEffect(() => {
    let itemCountSum = 0
    let priceSum = 0

    for (const cartItem of cartItems || []) {
      const quantityOfItem = cartItem.qty ?? 1
      const priceOfItem = cartItem.price ?? 0
      itemCountSum += quantityOfItem
      priceSum += quantityOfItem * priceOfItem
    }

    setTotalItems(itemCountSum)
    setTotalPrice(priceSum)
  }, [cartItems])

  // const { event } = useAnalytics()

  return (
    <Col md={3} className={cn(styles.cartTotalContainer, 'd-flex p-0')}>
      <div className={styles.totalWrapper}>
        <div>
          {cartItems && (
            <>
              <h3 className={styles.h3}>Shopping Cart</h3>
              <hr className={styles.border} />
              <div className={cn('d-flex justify-content-between')}>
                <h3 className={styles.h3}>{totalItems} Item(s)</h3>
                <h3 className={styles.h3}>{formatCurrency(totalPrice)}</h3>
              </div>
              <hr className={styles.border} />
              <div className="d-flex justify-content-between">
                <h3 className={styles.h3}>Total</h3>
                <h3 className={styles.h3}>{formatCurrency(totalPrice)}</h3>
              </div>
            </>
          )}
        </div>
        {error.state && (
          <Alert className={styles.errorAlert} variant="danger">
            <p>{error.description}</p>
          </Alert>
        )}
        <div className="d-flex flex-column p-0">
          {isSending ? (
            <Button className={cn(styles.button, 'p-2')} variant="primary" disabled>
              <div className={cn(styles.spinnerBorder, 'spinner-border')} role="status" />
            </Button>
          ) : (
            <Button
              className={cn(styles.button, 'p-2')}
              variant="primary"
              onClick={() => {
                proceedToCart()
              }}
            >
              Proceed to Cart
            </Button>
          )}
          <p className={cn(styles.h4, 'text-center mx-4 my-2')}>
            Items in this cart with be merged with your existing cart.
          </p>
        </div>
      </div>
    </Col>
  )
}

export default CartTotal
