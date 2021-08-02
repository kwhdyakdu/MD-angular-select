import React, { useState } from 'react'
import { Button, Col, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Entry } from 'contentful'
import { Store, Category, Model } from 'types/contenful.types'
import { FittingItem } from 'types/modamatch.types'
import cn from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useAnalytics from 'client/hooks/use-analytics.service'
import styles from './fitting-room.module.scss'
import RotateIcon from '../../../../public/icons/rotate.svg'

type ModelViewProps = {
  store: Store
  currentModel?: Entry<Model>
  selectedFittingItems: FittingItem[]
  visibleCategories: Entry<Category>[]
  isLoading: boolean
}

const getTooltipText = (selectedFittingItems: any, checkTypeOfClothing: (id: string) => any) => {
  let isWearingTop = false
  let isWearingBottom = false

  for (const selectedFittingItem of selectedFittingItems) {
    const { selectedTryOnItem } = selectedFittingItem

    if (
      selectedTryOnItem &&
      selectedTryOnItem.fields &&
      selectedTryOnItem.fields.item &&
      selectedTryOnItem.fields.item.fields
    ) {
      const clothingType = checkTypeOfClothing(selectedTryOnItem.fields.item.fields.category.sys.id)

      switch (clothingType) {
        case 1:
          isWearingTop = true
          break

        case 2:
          isWearingBottom = true
          break

        case 3:
          isWearingTop = true
          isWearingBottom = true
          break

        default:
          break
      }

      if (isWearingTop && isWearingBottom) {
        return null
      }
    }
  }

  if (isWearingTop) {
    return 'Add a Bottom'
  }
  if (isWearingBottom) {
    return 'Add a Top'
  }

  return 'Add a Top & Bottom'
}

const ModelView: React.FC<ModelViewProps> = ({
  store,
  currentModel,
  selectedFittingItems,
  visibleCategories,
  isLoading
}) => {
  const [tuckIn, setTuckIn] = useState(false)
  const { event } = useAnalytics()

  const { pathname } = useRouter()
  const shopType = pathname.split('/')[1]

  const checkTypeOfClothing = (id: string) => {
    const matchCategoryObject = visibleCategories.filter((category) => category.sys.id === id)
    // 1 = Tops
    // 2 = Bottoms
    // 3 = One Pieces
    return matchCategoryObject[0]?.fields.typeOfClothing
  }

  const tooltipText = getTooltipText(selectedFittingItems, checkTypeOfClothing)

  return (
    <div className={cn(styles.modelContainer, 'd-flex flex-column h-100')}>
      <RotateIcon  className={cn(styles.rotateIcon,)} />
      <div className={cn(styles.modelHolder, 'd-flex h-100')}>
        {currentModel && (
          <img src={currentModel.fields?.modelPictures[1].fields.file.url} alt="" className={styles.modelFullPic} />
        )}
        {selectedFittingItems.map(({ selectedTryOnItem }) => {
          if (selectedTryOnItem) {
            const clothingType = checkTypeOfClothing(selectedTryOnItem.fields.item.fields.category.sys.id)
            let clothingClassName
            switch (clothingType) {
              case 1:
                clothingClassName = styles.clothingTop
                break

              case 2:
                clothingClassName = styles.clothingBottoms
                break

              case 3:
                clothingClassName = styles.clothingOnePiece
                break

              case 5:
                clothingClassName = styles.clothingJacket
                break

              default:
                clothingClassName
            }
            return (
              <img
                key={selectedTryOnItem.sys.id}
                src={selectedTryOnItem.fields.itemLayer.fields.file.url}
                alt=""
                className={cn(styles.modelFullPic, clothingClassName, tuckIn ? styles.tuckedIn : '')}
              />
            )
          }
          return null
        })}
      </div>

      <div className={cn(styles.modelHolder, 'd-flex h-100')}>
        {currentModel && (
          <img src={currentModel.fields?.modelPictures[2].fields.file.url} alt="" className={styles.modelFullPic} />
        )}
        {selectedFittingItems.map(({ selectedTryOnItem }) => {
          if (selectedTryOnItem) {
            const clothingType = checkTypeOfClothing(selectedTryOnItem.fields.item.fields.category.sys.id)
            let clothingClassName
            switch (clothingType) {
              case 1:
                clothingClassName = styles.clothingTop
                break

              case 2:
                clothingClassName = styles.clothingBottoms
                break

              case 3:
                clothingClassName = styles.clothingOnePiece
                break

              case 5:
                clothingClassName = styles.clothingJacket
                break

              default:
                clothingClassName
            }
            return (
              <img
                key={selectedTryOnItem.sys.id}
                src={selectedTryOnItem.fields.itemLayerBack.fields.file.url}
                alt=""
                className={cn(styles.modelFullPic, clothingClassName, tuckIn ? styles.tuckedIn : '')}
              />
            )
          }
          return null
        })}
      </div>
      {isLoading ? (
        <Col md="12" className="d-flex justify-content-center align-items-center">
          <Spinner animation="grow" variant="primary" className="m-4" />
        </Col>
      ) : (
        <>
          <div className={cn(styles.bottomLayer, 'd-flex justify-content-between')}>
            <OverlayTrigger
              placement="right"
              overlay={
                tooltipText ? (
                  <Tooltip id="tooltip-right" className={cn(styles.tuckInBtnTooltip)}>
                    {tooltipText}
                  </Tooltip>
                ) : (
                  <div />
                )
              }
            >
              <div className={cn(styles.toggleTuckBtn, 'd-flex align-items-center')}>
                <h4 className={styles.h4}>Tuck In</h4>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={tuckIn}
                    onChange={() => {
                      setTuckIn(!tuckIn)
                      event({
                        category: 'Tuck In',
                        action: tuckIn ? 'Deselected' : 'Selected'
                      })
                      event({
                        category: 'Tuck In',
                        action: 'Result',
                        value: selectedFittingItems.length ? 1 : 0
                      })
                    }}
                  />
                  <span className={styles.toggle} />
                </label>
              </div>
            </OverlayTrigger>
            <div className={styles.changeModelBtn}>
              <Link href={`/${shopType}/${store.storeId}/choose-model`} passHref>
                <Button variant="dark">Change Model</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ModelView
