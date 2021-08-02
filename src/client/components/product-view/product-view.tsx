import cn from 'classnames'
import ReactHtmlParser from 'react-html-parser'
import { findProductVariant } from 'utils/product-utils'

// types
import { Entry } from 'contentful'
import { Store, Category, Model } from 'types/contenful.types'
import { HydratedProduct, FittingItem, ProductOptions, SelectedOptions } from 'types/modamatch.types'

// hooks
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useShopifyEmbed } from 'client/hooks/use-shopify-embed.hook'

// components
import { Row, Col, Button, Alert } from 'react-bootstrap'
import Link from 'next/link'
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery'
import useAnalytics from 'client/hooks/use-analytics.service'
import TopActionButton from './top-action-button'
import CheckIcon from '../../../../public/icons/check.svg'

// styles
import styles from './product-view.module.scss'

type ProductViewProps = {
  store?: Store
  category?: Category
  currentModel?: Entry<Model>
  product: HydratedProduct
  showColumnView?: Boolean
  productOptions?: ProductOptions
  selectedOptions?: SelectedOptions
  isLoading?: Boolean
  isShownSizeSmaller?: Boolean
  isShownMissingTryOnItem?: Boolean
  isShownOnFittingItems?: Boolean
  updateFittingItem?: (productId: string, partialFittingItem: Partial<FittingItem>) => void
  removeFromFittingItems?: (productId: string) => void
  toggleFittingItem?: (product: HydratedProduct, selectedOptions?: SelectedOptions) => void
  addToCartItems?: (product: HydratedProduct, selectedOptions?: SelectedOptions) => void
  isOnCartItems?: (product: HydratedProduct, selectedOptions?: SelectedOptions) => Boolean
}

const ProductView: React.FC<ProductViewProps> = ({
  store,
  category,
  currentModel,
  product,
  showColumnView,
  productOptions,
  selectedOptions,
  isLoading,
  isShownSizeSmaller,
  isShownMissingTryOnItem,
  isShownOnFittingItems,
  updateFittingItem,
  toggleFittingItem,
  removeFromFittingItems,
  addToCartItems,
  isOnCartItems
}) => {
  // state - shop vars
  const { pathname } = useRouter()
  const shopType = pathname.split('/')[1]
  const { formatCurrency } = useShopifyEmbed()

  // state - loading
  const [isSending, setSending] = useState(false)
  const [added, setAdded] = useState(false)
  const loadingAnimation = () => {
    setTimeout(() => {
      setAdded(true)
    }, 500)
    setTimeout(() => {
      setSending(false)
      setAdded(false)
    }, 1400)
  }

  // state - product variant
  const productVariant = useMemo(() => findProductVariant(product, selectedOptions), [product, selectedOptions])

  // state - image gallery ref and slide state
  const imageGalleryRef = useRef<ImageGallery>()
  useEffect(() => {
    // slide to image of selected variant (if there is any)
    const imageIndex = product.shopifyData?.images.findIndex((image) => image.id === productVariant?.image_id)
    if (imageIndex !== undefined && imageIndex !== -1) {
      imageGalleryRef.current?.slideToIndex(imageIndex)
    } else {
      imageGalleryRef.current?.slideToIndex(0)
    }
  }, [productVariant, product])

  // handler - product options
  const handleSelectOptions = useCallback(
    (partialSelectedOptions: Partial<SelectedOptions>) => {
      if (updateFittingItem) {
        const newSelectedOptions = {
          ...selectedOptions,
          ...(partialSelectedOptions as SelectedOptions)
        }
        updateFittingItem(product.id, {
          selectedOptions: newSelectedOptions
        })
      }
    },
    [product, selectedOptions, updateFittingItem]
  )

  // handler - item renderer
  const renderThumbInner = (item: ReactImageGalleryItem) => {
    return (
      <div className="image-gallery-thumbnail-inner">
        <img
          className="image-gallery-thumbnail-image"
          src={item.thumbnail}
          alt={item.thumbnailAlt}
          title={item.thumbnailTitle}
        />
        <div className="image-gallery-thumbnail-overlay" style={{ backgroundImage: `url(${item.thumbnail})` }} />
        {item.thumbnailLabel && <div className="image-gallery-thumbnail-label">{item.thumbnailLabel}</div>}
      </div>
    )
  }

  const { event } = useAnalytics()

  return (
    <Row className="h-100">
      <Col sm={showColumnView ? 12 : 6} className="h-100">
        <div
          className={cn(
            styles.productContainer,
            showColumnView ? 'h-100' : 'mt-5 px-3',
            showColumnView && styles.columnBorder
          )}
        >
          {!showColumnView && (
            <div className={cn(styles.breadcrumbs, 'mb-3')}>
              <h4 className={styles.h4}>
                <Link href={`/${shopType}/${store?.storeId}`}>
                  <a className={styles.link}>Pick your Fashion</a>
                </Link>{' '}
                &gt;{' '}
                <Link href={`/${shopType}/${store?.storeId}?category=${category?.category}`}>
                  <a className={styles.link}>{category?.category}</a>
                </Link>{' '}
                &gt; {product.title}
              </h4>
            </div>
          )}
          {!isLoading && isShownSizeSmaller && (
            <Alert variant="warning" className="mb-3">
              {`Size not available for ${currentModel?.fields?.name || 'this model'}. Try another size.`}
            </Alert>
          )}
          {!isLoading && isShownMissingTryOnItem && (
            <Alert variant="warning" className="mb-3">
              {`Try on item not available for ${
                currentModel?.fields?.name || 'this model'
              }. Try another size or product.`}
            </Alert>
          )}
          <div className={styles.productName}>
            <h1 className={cn(styles.h1, 'mb-3')}>{product.title}</h1>
          </div>
          <h1 className={cn(styles.h1, 'mt-4')}>{formatCurrency(productVariant?.price ?? product.price)}</h1>
          {showColumnView && productOptions?.color && (
            <div className={cn(styles.colours, 'd-flex align-items-center mt-4')}>
              <h3 className={cn(styles.h3, 'd-flex align-items-center mr-2')}>Color: </h3>
              <div className={cn(styles.colourSelection, 'd-flex align-items-center mr-2')}>
                {!isLoading ? (
                  productOptions.color.values.map((color: string) => (
                    <Fragment key={color}>
                      <input
                        className="mr-2"
                        type="radio"
                        id={color}
                        name="color"
                        value={color}
                        checked={selectedOptions?.color === color}
                        onChange={(e) =>
                          handleSelectOptions({
                            color: e.target.value
                          })
                        }
                      />
                      <label className={styles.colorRadio} htmlFor={color}>
                        {color}
                      </label>
                    </Fragment>
                  ))
                ) : (
                  <div className={cn(styles.spinnerBorder, 'spinner-border')} role="status">
                    <span className={styles.hidden}>Loading...</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {showColumnView && productOptions?.size ? (
            <>
              <div className={cn(styles.sizes, 'd-flex mt-4')}>
                <h3 className={cn(styles.h3, 'd-flex align-items-center mr-2')}>Sizes Available:</h3>
                {!isLoading && productOptions.size.values ? (
                  <select
                    className={styles.sizeSelect}
                    name="sortBy"
                    id="sortBy"
                    value={selectedOptions?.size}
                    onChange={(e) =>
                      handleSelectOptions({
                        size: e.target.value
                      })
                    }
                  >
                    {productOptions.size.values.map((size: string) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={cn(styles.spinnerBorder, 'spinner-border')} role="status">
                    <span className={styles.hidden}>Loading...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            showColumnView && <h3 className={cn(styles.h3, 'd-flex align-items-center mr-2 mt-3')}>One Size</h3>
          )}
          <div className="mt-4">
            <h3 className={cn(styles.h3, styles.productDetails)}>Product Details</h3>
            <div className={styles.productDescription}>
              {product.shopifyData?.body_html && ReactHtmlParser(product.shopifyData.body_html)}
            </div>
          </div>
          {!showColumnView && toggleFittingItem && (
            <div className={cn('row', 'justify-content-start')}>
              {isShownOnFittingItems ? (
                <div className={cn(styles.addedBox, styles.h3, 'mt-3', 'mr-3', 'col-3-auto')}>
                  <div className={cn(styles.textBox)}>
                    <CheckIcon className={cn(styles.checkIcon)} />
                    Added
                  </div>
                </div>
              ) : (
                <Button
                  className={cn(styles.addButton, styles.h3, 'mt-3', 'mr-3', 'col-3-auto')}
                  variant={isShownOnFittingItems ? 'primary' : 'outline-primary'}
                  onClick={() => {
                    setSending(true)
                    toggleFittingItem(product, selectedOptions)
                    loadingAnimation()

                    event({
                      category: 'Product Button',
                      action: 'Clicked',
                      label: 'Button'
                    })

                    event({
                      category: 'Product',
                      action: isShownOnFittingItems ? 'Removed' : 'Added',
                      label: product.title ?? product.id
                    })
                  }}
                >
                  Add to Fitting Room
                </Button>
              )}
              <Link href={`/${shopType}/${store?.storeId}`}>
                <Button
                  className={cn(styles.addMoreItemsButton, styles.h3, 'mt-3', 'mr-3', 'col-2-auto')}
                  variant="primary"
                >
                  Add More Items
                </Button>
              </Link>
              <Link href={`/${shopType}/${store?.storeId}/fitting-room`}>
                <div className={cn(styles.viewFittingRoomLinkContainer, styles.h3, 'mt-3', 'col-3-auto')}>
                  <a className={cn(styles.viewFittingRoomLink)}>View Fitting Room →</a>
                </div>
              </Link>
            </div>
          )}
          {showColumnView && addToCartItems && removeFromFittingItems && isOnCartItems && (
            <>
              <TopActionButton
                store={store}
                product={product}
                selectedOptions={selectedOptions}
                shopType={shopType}
                isSending={isSending}
                added={added}
                addToCartItems={addToCartItems}
                isOnCartItems={isOnCartItems}
                loadingAnimation={loadingAnimation}
                setSending={setSending}
              />

              {/*  REMOVE ITEM BUTTON
              
                <span 
                className={cn(styles.h3, styles.removeFromTryOn, 'mx-auto font-weight-medium btn-block')}
                onClick={() => {
                  setSending(true)
                  removeFromFittingItems(product.id)
                  loadingAnimation()
                  event({
                    category: 'Product Button',
                    action: 'Clicked',
                    label: 'Button'
                  })

                  event({
                    category: 'Product',
                    action: 'Removed',
                    label: product.title ?? product.id
                  })
                }}
                onKeyDown={() => {
                  setSending(true)
                  removeFromFittingItems(product.id)
                  loadingAnimation()
                }}
                role="button"
                tabIndex={0}
              >
                Remove Item
              </span> */}
              <Link href={`/${shopType}/${store?.storeId}/purchase`}>
                <span
                  className={cn(styles.h3, styles.viewCartButton, 'mx-auto font-weight-medium btn-block')}
                  role="button"
                  tabIndex={0}
                >
                  View Cart
                </span>
              </Link>
            </>
          )}
        </div>
      </Col>

      {!showColumnView && product.additionalImages && (
        <Col sm={6} className="h-100">
          <div className={cn(styles.itemImageContainer, 'mt-5')}>
            <ImageGallery
              ref={imageGalleryRef as any}
              items={
                product.additionalImages?.map((image, i) => ({
                  original: image ?? '',
                  thumbnail: image,
                  originalAlt: undefined,
                  key: i
                })) ?? []
              }
              showNav
              showPlayButton={false}
              showFullscreenButton={false}
              thumbnailPosition="right"
              renderThumbInner={renderThumbInner}
            />
          </div>
        </Col>
      )}
    </Row>
  )
}

export default ProductView
