import cn from 'classnames'
import { HydratedProduct } from 'types/modamatch.types'
import { MutableRefObject } from 'react'
import useAnalytics from 'client/hooks/use-analytics.service'
import styles from './pick-your-fashion.module.scss'
import ProductList from '../product-list/product-list'

type PickYourFashionProps = {
  products: HydratedProduct[]
  isLoading?: boolean
  loaderRef?: MutableRefObject<HTMLDivElement | undefined | null>
  sortBy: string
  setSortBy: (newSortBy: string) => void
}

const PickYourFashion: React.FC<PickYourFashionProps> = ({ products, isLoading, loaderRef, sortBy, setSortBy }) => {
  const { event } = useAnalytics()

  return (
    <div className="d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className={styles.h1}>Pick Your Fashion</h1>
        <div className="d-flex align-items-center">
          <h3 className={cn('pr-1', styles.h3)}>Sort Price By:</h3>
          <select
            className={styles.sortByFilter}
            name="sortBy"
            id="sortBy"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              event({
                category: 'Sorting',
                action: 'Selected',
                label: e.target.value
              })
            }}
          >
            <option value="price-desc">Highest to Lowest</option>
            <option value="price-asc">Lowest to Highest</option>
          </select>
        </div>
      </div>

      <ProductList products={products} isLoading={isLoading} loaderRef={loaderRef} />
    </div>
  )
}

export default PickYourFashion
