import { Category, Store } from 'types/contenful.types'
import { Button } from 'react-bootstrap'
import 'rc-slider/assets/index.css'
import cn from 'classnames'
import Slider from 'rc-slider'
import { EntryCollection } from 'contentful'
import { useMemo, useState, useEffect } from 'react'
import { useShopifyEmbed } from 'client/hooks/use-shopify-embed.hook'
import useSWR from 'swr'
import { fetcher } from 'client/utils/swr-fetcher'
import querystring from 'querystring'
import { HydratedProduct } from 'types/modamatch.types'
import useAnalytics from 'client/hooks/use-analytics.service'
import styles from './pick-filter.module.scss'

type PickFilterProps = {
  activeCategory?: string
  setActiveCategory: (category?: string) => void
  categories?: EntryCollection<Category>
  setFilter: (filter: { [key: string]: any }) => void
  filter: { [key: string]: any }
  store?: Store
  products?: HydratedProduct[]
}

const ANY_OFFSET = 100

const { createSliderWithTooltip } = Slider
const Range = createSliderWithTooltip(Slider.Range)

const PickFilter: React.FC<PickFilterProps> = ({
  activeCategory,
  setActiveCategory,
  categories,
  setFilter,
  filter,
  store,
  products
}) => {
  const { event } = useAnalytics()

  const { formatCurrency } = useShopifyEmbed()
  // fetch category counts
  const { data: categoryTotals } = useSWR<number[]>(
    `/api/categories/count?${querystring.encode({
      shopName: store?.storeId,
      ids: categories?.items.map((category) => category.sys.id),
      ...filter
    })}`,
    fetcher
  )

  // get max product price

  // set limit state
  const [priceRange, setPriceRange] = useState({ min: 0, max: ANY_OFFSET })
  const [priceLimit, setPriceLimit] = useState({ min: 0, max: 0 })

  // mantain current max limit and "any" state
  useEffect(() => {
    // get current product's max price
    const productsMaxPrice =
      products?.reduce((prevMaxPrice, { price = 0 }) => (price > prevMaxPrice ? price : prevMaxPrice), 0) ?? 0
    // if current max price is more than our limits
    if (productsMaxPrice > priceLimit.max) {
      // set price range to new "any" offset, if already in it
      if (priceRange.max > priceLimit.max) {
        setPriceRange({ min: priceRange.min, max: productsMaxPrice + ANY_OFFSET })
      }
      // set max price limit to current max limit
      setPriceLimit({ min: priceLimit.min, max: productsMaxPrice })
    }
  }, [products, priceRange, priceLimit])

  const handleRangeChange = (newPriceRange: number[]) => {
    setPriceRange({ min: newPriceRange[0], max: newPriceRange[1] })
  }

  // price range handler
  const handleAfterRangeChange = (newPriceRange: number[]) => {
    setFilter({ priceRange: [newPriceRange[0], newPriceRange[1] <= priceLimit.max ? newPriceRange[1] : undefined] })
  }

  return (
    <div>
      <div className={cn(styles.categories, 'd-flex flex-column')}>
        <Button
          key="All"
          active={activeCategory === undefined}
          className={cn(styles.button, { [styles.active]: activeCategory === undefined }, 'text-left')}
          variant="text"
          onClick={() => {
            setActiveCategory(undefined)
            event({
              category: 'Categories',
              action: 'Selected',
              label: 'All'
            })
          }}
        >
          <h3 className={styles.h3}>All ({categoryTotals?.reduce((a, b) => a + b, 0) ?? '...'})</h3>
        </Button>
        {categories?.items?.map((category, index) => (
          <Button
            key={category.sys.id}
            active={activeCategory === `${category.sys.id}`}
            className={cn(styles.button, { [styles.active]: activeCategory === category.sys.id }, 'text-left')}
            variant="text"
            onClick={() => {
              setActiveCategory(category.sys.id)
              event({
                category: 'Categories',
                action: 'Selected',
                label: category.fields.category
              })
            }}
          >
            <h3 className={styles.h3}>
              {category.fields.category} ({categoryTotals?.[index] ?? '...'})
            </h3>
          </Button>
        ))}
      </div>
      <hr className={styles.hr} />
      <div className="mt-3">
        <h3 className={styles.h3}>Price Range</h3>
        <div>
          <div className="d-flex justify-content-between my-3">
            <h3 className={styles.h3}>{formatCurrency(priceRange.min ?? 0)}</h3>
            <h3 className={styles.h3}>{formatCurrency(priceRange.max)}</h3>
          </div>

          <Range
            min={priceLimit.min}
            max={priceLimit.max + ANY_OFFSET}
            value={[priceRange.min, priceRange.max]}
            onChange={handleRangeChange}
            onAfterChange={handleAfterRangeChange}
            pushable
            trackStyle={[{ backgroundColor: 'var(--primary)' }]}
            handleStyle={[
              { backgroundColor: 'var(--primary)', border: 'solid 2px var(--primary)' },
              { backgroundColor: 'var(--primary)', border: 'solid 2px var(--primary)' }
            ]}
            tipFormatter={(value) => (value <= priceLimit.max ? formatCurrency(value) : 'Any')}
            tipProps={{
              placement: 'bottom'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default PickFilter
