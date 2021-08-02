import { useState, useEffect, useCallback } from 'react'
import { Form, Button } from 'react-bootstrap'
import cn from 'classnames'
import Slider from 'rc-slider'
import { EntryCollection } from 'contentful'
import { Model, GalleryModel } from 'types/contenful.types'
import { findIndexes, isNumberBetween } from 'utils/general-utils'
import { cmToFeet, cmToInches, lbsToKgs } from 'utils/unit-convert'
import 'rc-slider/assets/index.css'
import useAnalytics from 'client/hooks/use-analytics.service'
import styles from './pick-measurements.module.scss'

const HEIGHT_MIN_CM = 140
const HEIGHT_MAX_CM = 205
const HEIGHT_MARGIN = 10

const WEIGHT_MIN_LBS = 80
const WEIGHT_MAX_LBS = 280
const WEIGHT_MARGIN = 10

type PickYourMeasurementsProps = {
  heightInCM: boolean
  setHeightInCM: (heightBoolean: boolean) => void
  weightInLBS: boolean
  setWeightInLBS: (weightBoolean: boolean) => void
  models?: EntryCollection<Model>
  setGalleryModels: (galleryModels: GalleryModel[]) => void
  setActiveModel: (number: number) => void
}

const PickYourMeasurements: React.FC<PickYourMeasurementsProps> = ({
  heightInCM,
  setHeightInCM,
  weightInLBS,
  setWeightInLBS,
  models,
  setGalleryModels,
  setActiveModel
}) => {
  const { event } = useAnalytics()

  const [selectedGender, setSelectedGender] = useState(1)
  const genderRadio = [
    { gender: 'Female', value: 1 },
    { gender: 'Male', value: 2 }
  ]

  const [height, setHeight] = useState((HEIGHT_MIN_CM + HEIGHT_MAX_CM) / 2)
  const [heightLimit, setHeightLimit] = useState({ min: HEIGHT_MIN_CM, max: HEIGHT_MAX_CM })
  const [weight, setWeight] = useState((WEIGHT_MIN_LBS + WEIGHT_MAX_LBS) / 2)
  const [weightLimit, setWeightLimit] = useState({ min: WEIGHT_MIN_LBS, max: WEIGHT_MAX_LBS })

  const [selectedBellySize, setSelectedBellySize] = useState(1)
  const [selectedHipSize, setSelectedHipSize] = useState(1)
  const bellyHipSizes = [
    { size: 'Small', value: 1 },
    { size: 'Medium', value: 2 },
    { size: 'Large', value: 3 }
  ]

  // uncomment to constrain limits based on available models
  // useEffect(() => {
  //   if (models?.items.length) {
  //     const heights = models?.items.map(({ fields }) => fields.height) ?? []
  //     const weights = models?.items.map(({ fields }) => fields.weight) ?? []
  //     const newHeightLimit = {
  //       min: Math.min(...heights) - HEIGHT_MARGIN,
  //       max: Math.max(...heights) + HEIGHT_MARGIN
  //     }
  //     const newWeightLimit = {
  //       min: Math.min(...weights) - WEIGHT_MARGIN,
  //       max: Math.max(...weights) + WEIGHT_MARGIN
  //     }
  //     setHeightLimit(newHeightLimit)
  //     setWeightLimit(newWeightLimit)
  //     setHeight((newHeightLimit.min + newHeightLimit.max) / 2)
  //     setWeight((newWeightLimit.min + newWeightLimit.max) / 2)
  //   }
  // }, [models, setHeightLimit, setWeightLimit, setHeight, setWeight])

  const handleFindModels = useCallback(() => {
    if (models?.items.length) {
      const hiddenIndexes = findIndexes(
        models.items,
        ({ fields }) =>
          !(
            isNumberBetween(fields.height, height - HEIGHT_MARGIN, height + HEIGHT_MARGIN, true) &&
            isNumberBetween(fields.weight, weight - WEIGHT_MARGIN, weight + WEIGHT_MARGIN, true)
          )
      )
      const galleryModels: GalleryModel[] = models.items
        .map((model, index) => ({ model, index }))
        .filter(({ index }) => !hiddenIndexes.includes(index))
      setGalleryModels(galleryModels)
      setActiveModel(galleryModels[0]?.index ?? -1)

      event({
        category: 'Model Search',
        action: 'Entered',
        label: `height: ${height} weight: ${weight}`
      })
      event({
        category: 'Model Search',
        action: 'Result',
        value: galleryModels.length
      })
    }
  }, [models, setGalleryModels, setActiveModel, event, height, weight])

  const handleShowAllModels = useCallback(() => {
    if (models?.items.length) {
      const galleryModels = models.items.map((model, index) => ({ model, index }))
      setGalleryModels(galleryModels)
      setActiveModel(0)
    }
  }, [models, setGalleryModels, setActiveModel])

  return (
    <div className={cn(styles.measurementContainer, 'h-100 py-3 px-1 px-lg-2')}>
      {/* ---------- MY GENDER SECTION ---------- */}
      {/* <div className={cn('d-flex flex-column mb-4')}>
        <h3 className={cn(styles.h3, 'font-weight-bold')}>My Gender</h3>

        <div className="d-flex">
          {genderRadio.map((gender) => (
            <div className="mt-3 d-flex align-items-center" key={`gender-${gender.value}`}>
              <Form.Check
                custom
                className={cn('mr-2', styles.h3)}
                type="radio"
                id={gender.gender}
                name="gender"
                label={gender.gender}
                value={gender.value}
                checked={selectedGender === gender.value}
                onChange={(e: any) => setSelectedGender(parseInt(e.target.value, 10))}
              />
            </div>
          ))}
        </div>
      </div> */}

      {/* ---------- MY HEIGHT SECTION ----------*/}
      <div className="d-flex flex-column align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center justify-content-between w-100 mb-4">
          <h3 className={cn(styles.h3, 'font-weight-bold')}>My Height</h3>

          <div className={cn(styles.toggleContainer, 'd-flex align-items-center')}>
            <h4 className={styles.h4}>FT</h4>
            <label className={styles.switch}>
              <input type="checkbox" checked={heightInCM} onChange={() => setHeightInCM(!heightInCM)} />
              <span className={styles.toggle} />
            </label>
            <h4 className={styles.h4}>CM</h4>
          </div>
        </div>

        <Slider
          min={heightLimit.min}
          max={heightLimit.max + 1}
          defaultValue={height}
          onChange={setHeight}
          trackStyle={{ backgroundColor: 'var(--primary)' }}
          handleStyle={{ backgroundColor: 'var(--primary)', border: 'solid 2px var(--primary)' }}
        />

        <div className={cn(styles.metricDisplay, 'w-100 mt-3 p-2 text-center')}>
          {heightInCM ? (
            <p className={styles.h1}>{height} cm</p>
          ) : (
            <p className={styles.h1}>
              {Math.floor(cmToFeet(height))} ft <span className="ml-2">{Math.floor(cmToInches(height))} in</span>
            </p>
          )}
        </div>
      </div>

      {/* ---------- MY WEIGHT SECTION ----------*/}
      <div className="d-flex flex-column align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center justify-content-between w-100 mb-4">
          <h3 className={cn(styles.h3, 'font-weight-bold')}>My Weight</h3>

          <div className={cn(styles.toggleContainer, 'd-flex align-items-center')}>
            <h4 className={styles.h4}>KG</h4>
            <label className={styles.switch}>
              <input type="checkbox" checked={weightInLBS} onChange={() => setWeightInLBS(!weightInLBS)} />
              <span className={styles.toggle} />
            </label>
            <h4 className={styles.h4}>LBS</h4>
          </div>
        </div>

        <Slider
          min={weightLimit.min}
          max={weightLimit.max + 1}
          defaultValue={weight}
          onChange={setWeight}
          trackStyle={{ backgroundColor: 'var(--primary)' }}
          handleStyle={{ backgroundColor: 'var(--primary)', border: 'solid 2px var(--primary)' }}
        />

        <div className={cn(styles.metricDisplay, 'w-100 mt-3 p-2 text-center')}>
          {weightInLBS ? (
            <p className={styles.h1}>{weight} lbs</p>
          ) : (
            <p className={styles.h1}>{Math.round(lbsToKgs(weight))} kg</p>
          )}
        </div>
      </div>

      {/* ---------- BELLY SIZE SECTION ---------- */}
      {/* <div className={cn('d-flex flex-column mb-4')}>
        <h3 className={cn(styles.h3, 'font-weight-bold')}>Belly Size</h3>

        <div className="d-flex">
          {bellyHipSizes.map((size) => (
            <div className="mt-3" key={`belly-${size.size}`}>
              <Form.Check
                custom
                className={cn('mr-2 d-flex align-items-center', styles.h3)}
                type="radio"
                id={`belly-${size.size}`}
                name="bellySize"
                label={size.size}
                value={size.value}
                checked={selectedBellySize === size.value}
                onChange={(e: any) => setSelectedBellySize(parseInt(e.target.value, 10))}
              />
            </div>
          ))}
        </div>
      </div> */}

      {/* ---------- HIP SIZE SECTION ---------- */}
      {/* <div className={cn('d-flex flex-column mb-4')}>
        <h3 className={cn(styles.h3, 'font-weight-bold')}>Hip Size</h3>

        <div className="d-flex">
          {bellyHipSizes.map((size) => (
            <div className="mt-3" key={`hip-${size.size}`}>
              <Form.Check
                custom
                className={cn('mr-2 d-flex align-items-center', styles.h3)}
                type="radio"
                id={`hip-${size.size}`}
                name="hipSize"
                label={size.size}
                value={size.value}
                checked={selectedHipSize === size.value}
                onChange={(e: any) => setSelectedHipSize(parseInt(e.target.value, 10))}
              />
            </div>
          ))}
        </div>
      </div> */}

      {/* ---------- FILTER ACTIONS SECTION ---------- */}
      <div className={cn('d-flex flex-column mb-4')}>
        <Button className={cn(styles.makeMyModelBtn, 'py-3 mb-3')} onClick={handleFindModels}>
          <p className={cn(styles.h3, 'text-white')}>Find Models</p>
        </Button>
        <Button className={cn(styles.makeMyModelBtn, 'py-3')} onClick={handleShowAllModels}>
          <p className={cn(styles.h3, 'text-white')}>Show All Models</p>
        </Button>
      </div>
    </div>
  )
}

export default PickYourMeasurements
