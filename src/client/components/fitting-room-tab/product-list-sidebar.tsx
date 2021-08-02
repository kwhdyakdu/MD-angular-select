import { Category } from 'types/contenful.types'
import { FittingItem } from 'types/modamatch.types'
import { Form } from 'react-bootstrap'
import { Entry } from 'contentful'
import { Card, Col, Row, Spinner } from 'react-bootstrap'
import cn from 'classnames'
import styles from './product-list-sidebar.module.scss'

type ProductListSidebarProps = {
  fittingItems: FittingItem[]
  selectedProductIds: string[]
  onSelectProductId: (selectedProductId: string) => void
  visibleCategories: Entry<Category>[]
  categoryId: string
  setCategoryId: (categoryId: string) => void
  isLoading: boolean
  loaderRef: any
}

const ProductListSidebar: React.FC<ProductListSidebarProps> = ({
  fittingItems,
  selectedProductIds,
  onSelectProductId,
  visibleCategories,
  categoryId,
  setCategoryId,
  isLoading,
  loaderRef
}) => {
  return (
    <div>
      <Form.Control as="select" custom onChange={(e) => setCategoryId(e.target.value)} value={categoryId}>
        <option value="">All</option>
        {visibleCategories.map((category) => (
          <option key={category.sys.id} value={category.sys.id}>
            {category.fields.category}
          </option>
        ))}
      </Form.Control>
      <Row>
        {fittingItems?.map((fittingItem) => {
          const { productId, fullProduct } = fittingItem
          return (
            <Col md="6" lg="6" className="pt-4" key={productId} data-key={productId}>
              <Card
                className={cn('d-flex', styles.productCard, selectedProductIds.includes(productId) && styles.active)}
                onClick={() => onSelectProductId(productId)}
              >
                <div
                  className={styles.productImage}
                  style={{ backgroundImage: `url(${fullProduct.mainImageUrl ?? fullProduct.imageUrl})` }}
                />
              </Card>
            </Col>
          )
        })}

        {isLoading && (
          <Col md="12" className="d-flex justify-content-center align-items-center" ref={loaderRef as any}>
            <Spinner animation="grow" variant="primary" className="m-4" />
          </Col>
        )}

        {!isLoading && !fittingItems.length && (
          <Col md="12" className="mt-4">
            There are no products in this category
          </Col>
        )}
      </Row>
    </div>
  )
}

export default ProductListSidebar
