import Link from 'next/link'
import cn from 'classnames'
import { MutableRefObject } from 'react'

// types
import { HydratedProduct } from 'types/modamatch.types'

// hooks
import { useRouter } from 'next/router'
import { useShopifyEmbed } from 'client/hooks/use-shopify-embed.hook'
import { useCustomerSettings } from 'client/hooks/use-customer-settings'

// components
import { Button, Card, Col, Row, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap'
import useAnalytics from 'client/hooks/use-analytics.service'
import HangerEmptyIcon from '../../../../public/icons/hanger-empty.svg'

// styles
import styles from './product-list.module.scss'

type ProductListProps = {
  products: HydratedProduct[]
  isLoading?: boolean
  loaderRef?: MutableRefObject<HTMLDivElement | undefined | null>
}



const ProductList: React.FC<ProductListProps> = ({ products, isLoading, loaderRef }) => {
  const { query, pathname } = useRouter()
  const { formatCurrency } = useShopifyEmbed()
  const { toggleFittingItem, isOnFittingItems } = useCustomerSettings()
  const shopType = pathname.split('/')[1]

  const { event } = useAnalytics()

  return (
    <Row>
      {products.map((product) => (
        <Col md="4" lg="3" key={product.id} className="pt-4">
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="tooltip-right" className={cn(styles.tryOnBtnTooltip)}>
                Add to Fitting Room
              </Tooltip>
            }
          >
            <Button
              variant="outline-primary"
              className={cn(
                'd-flex justify-content-center align-items-center',
                styles.tryOnBtn,
                isOnFittingItems(product.id) && ['active', styles.active]
              )}
              onClick={() => {
                toggleFittingItem(product)
                event({
                  category: 'Product Button',
                  action: 'Clicked',
                  label: 'Icon'
                })
                event({
                  category: 'Product',
                  action: isOnFittingItems(product.id) ? 'Removed' : 'Added',
                  label: product.title ?? product.id
                })
              }}
            >
              <HangerEmptyIcon />
            </Button>
          </OverlayTrigger>
          <Link href={`/${shopType}/${query.storeId}/product/${product.id}`}>
            <a>
              <Card className={cn('d-flex', styles.productCard)}>
                <div
                  className={styles.productImage}
                  style={{ backgroundImage: `url(${product.mainImageUrl ?? product.imageUrl})` }}
                />
              </Card>
              <div className="pt-2">
                <h4 className={cn('text-center', styles.h4)}>{product.title}</h4>
                <div className={cn('text-primary text-center', styles.h4)}>{formatCurrency(product.price)}</div>
              </div>
            </a>
          </Link>
        </Col>
      ))}

      {isLoading && (
        <Col md="12" className="d-flex justify-content-center align-items-center" ref={loaderRef as any}>
          <Spinner animation="grow" variant="primary" className="m-4" />
        </Col>
      )}

      {!isLoading && products.length === 0 && (
        <Col md="12" className="mt-4">
          There are no products in this category yet
        </Col>
      )}
    </Row>
  )
}

export default ProductList
