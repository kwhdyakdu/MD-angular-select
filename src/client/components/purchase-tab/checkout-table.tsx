import React from 'react'
import cn from 'classnames'
// import { findProductVariant } from 'utils/product-utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/pro-regular-svg-icons'

// Hooks
import { useShopifyEmbed } from 'client/hooks/use-shopify-embed.hook'

// Components
import { Store } from 'types/contenful.types'
import { CartItem } from 'types/modamatch.types'
import { Col, Row, OverlayTrigger, Tooltip } from 'react-bootstrap'
import useAnalytics from 'client/hooks/use-analytics.service'
import styles from './checkout-table.module.scss'

type CheckoutCartItemProps = {
  cartItem: CartItem
  removeFromCartItems?: (productId: string | undefined, variantId: number) => void
  updateCartItem: (variantId: number, cartItem: Partial<CartItem>) => void
}

type CheckoutTableProps = {
  store?: Store
  cartItems?: CartItem[]
  removeFromCartItems?: (productId: string | undefined, variantId: number) => void
  updateCartItem: (variantId: number, cartItem: Partial<CartItem>) => void
}

const CheckoutCartItem: React.FC<CheckoutCartItemProps> = ({ cartItem, removeFromCartItems, updateCartItem }) => {
  const { formatCurrency } = useShopifyEmbed()
  const { event } = useAnalytics()

  const { variantId, fullProduct } = cartItem
  // const productVariant = findProductVariant(fullProduct, selectedOptions)
  // const variantImage = fullProduct.shopifyData?.images.find((image) => image.id === productVariant?.image_id)?.src

  return (
    <Row className={cn(styles.itemRow, 'align-items-center no-gutters')} key={variantId}>
      <Col xs={4} className="d-flex align-items-center">
        <div
          className={cn(styles.productImage, 'mr-1')}
          style={{ backgroundImage: `url(${fullProduct.mainImageUrl ?? fullProduct.imageUrl})` }}
        />
        <h3 className={styles.h4}>{cartItem.title}</h3>
      </Col>

      <Col xs={2}>
        <h3 className={styles.h4}>{cartItem.selectedOptions?.size ?? 'O/S'}</h3>
      </Col>

      <Col xs={2}>
        <h3 className={styles.h4}>{cartItem.selectedOptions?.color ?? 'N/A'}</h3>
      </Col>

      <Col xs={1}>
        <input
          className={(styles.h4, styles.qtyInput)}
          type="number"
          id="number"
          value={cartItem.qty}
          onChange={(e) => {
            if (variantId !== undefined && cartItem.productId) {
              const newQty = Number(e.target.value)
              if (newQty > 0) {
                updateCartItem(variantId, {
                  variantId: cartItem.variantId,
                  productId: cartItem.productId,
                  qty: newQty
                })
              }
            }
          }}
        />
      </Col>

      <Col xs={2}>
        <h3 className={styles.h4}>{formatCurrency(cartItem.price)}</h3>
      </Col>

      {removeFromCartItems && (
        <Col xs={1} className="d-flex align-items-center">
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id="tooltip-left" className={cn(styles.removeItemTooltip)}>
                Remove Item
              </Tooltip>
            }
          >
            <button
              type="button"
              className={styles.removeItem}
              onClick={() => {
                removeFromCartItems(cartItem.productId, variantId)
                event({
                  category: 'Product Cart',
                  action: 'Removed',
                  label: cartItem.title ?? cartItem.variantId.toString()
                })
              }}
              onKeyDown={() => {
                removeFromCartItems(cartItem.productId, variantId)
                event({
                  category: 'Product Cart',
                  action: 'Removed',
                  label: cartItem.title ?? cartItem.variantId.toString()
                })
              }}
            >
              <FontAwesomeIcon icon={faTimes} fixedWidth />
            </button>
          </OverlayTrigger>
        </Col>
      )}
    </Row>
  )
}

const CheckoutTable: React.FC<CheckoutTableProps> = ({ cartItems, removeFromCartItems, updateCartItem }) => {
  return (
    <Col md={9} className={cn(styles.tableContainer, 'h-100 overflow-auto')}>
      <Row className={cn(styles.rowHeader, 'no-gutters')}>
        <Col xs={4}>
          <h3 className={styles.h3}>Item</h3>
        </Col>

        <Col xs={2}>
          <h3 className={styles.h3}>Size</h3>
        </Col>

        <Col xs={2}>
          <h3 className={styles.h3}>Color</h3>
        </Col>

        <Col xs={1}>
          <h3 className={styles.h3}>Qty</h3>
        </Col>

        <Col xs={2}>
          <h3 className={styles.h3}>Price</h3>
        </Col>

        <Col xs={1} />
      </Row>

      {cartItems?.map((cartItem) => (
        <CheckoutCartItem
          key={`${cartItem.productId}-${cartItem.variantId}`}
          cartItem={cartItem}
          removeFromCartItems={removeFromCartItems}
          updateCartItem={updateCartItem}
        />
      ))}
    </Col>
  )
}

export default CheckoutTable
