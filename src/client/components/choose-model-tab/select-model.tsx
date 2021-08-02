import { useState } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import { Model, GalleryModel } from 'types/contenful.types'
import { EntryCollection } from 'contentful'
import cn from 'classnames'
import useAnalytics from 'client/hooks/use-analytics.service'
import MeasurementsIcon from '../../../../public/icons/measurement-tape.svg'
import styles from './select-model.module.scss'

type SelectModelProps = {
  models?: EntryCollection<Model>
  galleryModels: GalleryModel[]
  activeModel: number
  setActiveModel: (number: number) => void
  heightInCM: boolean
  weightInLBS: boolean
  onSelectModel: (number: number) => void
}

const SelectModel: React.FC<SelectModelProps> = ({
  models,
  galleryModels,
  activeModel,
  setActiveModel,
  heightInCM,
  weightInLBS,
  onSelectModel
}) => {
  const [showModelMeasurements, setShowModelMeasurements] = useState(false)
  const currentModel = activeModel !== -1 ? models?.items[activeModel] : undefined
  const { height = 0, weight = 0, neck, chest, waist, hip, thighs } = currentModel?.fields ?? {}

  const { event } = useAnalytics()

  return (
    <Row>
      {/* Select Model Component */}
      <Col md={6} className="d-flex flex-column px-3 mb-2">
        <div>
          <h1 className={cn(styles.h1, 'mb-4')}>Select Model</h1>
        </div>

        {/* Gallery of Model Thumbnails */}
        {!galleryModels?.length ? (
          <p className={cn(styles.h4, 'font-weight-bold mb-2')}>No models found using current filters.</p>
        ) : (
          <div className="d-flex flex-wrap justify-content-around">
            {galleryModels?.map(({ model, index }) => (
              <div
                className={cn(styles.modelSelect, 'd-flex flex-column align-items-center mb-2')}
                key={`model-${model.fields.name}`}
              >
                <button
                  className={cn(styles.modelThumbnail, activeModel === index ? styles.activeModel : '', 'd-flex p-0')}
                  onClick={() => {
                    setActiveModel(index)
                    event({
                      category: 'Model',
                      action: 'Viewed',
                      label: model.fields.name
                    })
                  }}
                  type="button"
                >
                  <img src={model.fields.profilePicture.fields.file.url} alt="" />
                </button>
                <p className={cn(styles.h4, 'font-weight-bold mt-3')}>{model.fields.name}</p>
              </div>
            ))}
          </div>
        )}
      </Col>

      <Col md={6} className="px-3 pl-md-0">
        {currentModel && (
          <div className={cn(styles.chosenModel, 'd-flex flex-column align-items-center sticky-top')}>
            {/* Display Model's Height & Weight */}
            <div className={styles.heightWeight}>
              <p className={cn(styles.h4, 'font-weight-bold mb-2')}>
                Height:{' '}
                {heightInCM ? (
                  <span>{height} cm</span>
                ) : (
                  <span>
                    {Math.floor((height * 0.39) / 12)} ft {Math.round((height * 0.39) % 12)} in
                  </span>
                )}
              </p>
              <p className={cn(styles.h4, 'font-weight-bold')}>
                Weight: {weightInLBS ? <span>{weight} lbs</span> : <span>{Math.round(weight * 0.45359237)} kg</span>}
              </p>
            </div>

            {/* Show Model Measurements Button */}
            <button
              className={cn(styles.measurementsButton, showModelMeasurements ? styles.measurementsOn : '')}
              onClick={() => setShowModelMeasurements(!showModelMeasurements)}
              type="button"
            >
              <MeasurementsIcon />
            </button>

            {/* Full Model Container */}
            <div className={cn(styles.fullModel, 'd-flex')}>
              <img src={models?.items[activeModel].fields.modelPictures[0].fields.file.url} className="p-3" alt="" />
            </div>

            <div className={cn(styles.fullModel, 'd-flex')}>
              <img src={models?.items[activeModel].fields.modelPictures[2].fields.file.url} className="p-3" alt="" />
            </div>

            <Button
              className={cn(styles.makeMyModelBtn, 'py-3 mx-2')}
              onClick={() => {
                onSelectModel(activeModel)
                event({
                  category: 'Model',
                  action: 'Selected',
                  label: models?.items[activeModel].fields.name ?? activeModel.toString()
                })
              }}
            >
              <p className={cn(styles.h3, 'text-white')}>Select {models?.items[activeModel].fields.name} as My Model</p>
            </Button>

            {/* Show Model Measurements */}
            <div className={cn(styles.displayMeasurements, showModelMeasurements ? '' : styles.hideMeasurements)}>
              {/* Left Side Measurements */}
              <div className={styles.leftMeasurements}>
                <div className={cn(styles.measurementCard, 'd-flex flex-column px-1 py-2 mb-5')}>
                  <p className={cn(styles.h4, 'text-center text-white')}>Chest</p>
                  <p className={cn(styles.h4, 'text-center text-white')}>{chest} in</p>
                </div>
                <div className={cn(styles.measurementCard, 'd-flex flex-column px-1 py-2')}>
                  <p className={cn(styles.h4, 'text-center text-white')}>Hips</p>
                  <p className={cn(styles.h4, 'text-center text-white')}>{hip} in</p>
                </div>
              </div>

              {/* Right Side Measurements */}
              <div className={styles.rightMeasurements}>
                <div className={cn(styles.measurementCard, 'd-flex flex-column px-1 py-2 mb-5')}>
                  <p className={cn(styles.h4, 'text-center text-white')}>Neck</p>
                  <p className={cn(styles.h4, 'text-center text-white')}>{neck} in</p>
                </div>
                <div className={cn(styles.measurementCard, 'd-flex flex-column px-1 py-2 mb-5')}>
                  <p className={cn(styles.h4, 'text-center text-white')}>Waist</p>
                  <p className={cn(styles.h4, 'text-center text-white')}>{waist} in</p>
                </div>
                <div className={cn(styles.measurementCard, 'd-flex flex-column px-1 py-2')}>
                  <p className={cn(styles.h4, 'text-center text-white')}>Thighs</p>
                  <p className={cn(styles.h4, 'text-center text-white')}>{thighs} in</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Col>
    </Row>
  )
}

export default SelectModel
