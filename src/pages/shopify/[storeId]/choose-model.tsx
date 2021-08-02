import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useCallback, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'

import { contentfulService } from 'server/services'
import { Store, Model, GalleryModel } from 'types/contenful.types'
import { EntryCollection } from 'contentful'
import IFrameLayout from 'client/layouts/iframe-layout'
import Error404Page from 'pages/404'
import PickMeasurements from 'client/components/choose-model-tab/pick-measurements'
import SelectModel from 'client/components/choose-model-tab/select-model'
import Router, { useRouter } from 'next/router'
import { useCustomerSettings } from 'client/hooks/use-customer-settings'

type ChooseModelProps = {
  store?: Store
  models?: EntryCollection<Model>
}

const ChooseModel: NextPage<ChooseModelProps> = ({ store, models }) => {
  const { pathname } = useRouter()
  const storeType = pathname.split('/')[1]

  const initialModels = models?.items.map((model, index) => ({ model, index })) ?? []
  const [galleryModels, setGalleryModels] = useState<GalleryModel[]>(initialModels)
  const [heightInCM, setHeightInCM] = useState(true)
  const [weightInLBS, setWeightInLBS] = useState(true)
  const [activeModel, setActiveModel] = useState(0)
  const { setModel, clearFittingItemsOptions } = useCustomerSettings()

  const handleSelectModel = useCallback(
    (modelId: number) => {
      setModel(modelId)
      localStorage.setItem('model', String(modelId))
      clearFittingItemsOptions()
      Router.push(`/${storeType}/${store?.storeId}/fitting-room`)
    },
    [setModel, clearFittingItemsOptions, storeType, store?.storeId]
  )

  if (!store) {
    return <Error404Page />
  }

  return (
    // Uncomment for French
    // <IntlProvider messages={messagesInFrench} defaultLocale="en" locale="fr" >
    <IntlProvider defaultLocale="en" locale="en">
      <IFrameLayout title="Choose Model - Shopify" store={store} hasSidebar>
        <PickMeasurements
          heightInCM={heightInCM}
          setHeightInCM={setHeightInCM}
          weightInLBS={weightInLBS}
          setWeightInLBS={setWeightInLBS}
          models={models}
          setGalleryModels={setGalleryModels}
          setActiveModel={setActiveModel}
        />
        <SelectModel
          onSelectModel={handleSelectModel}
          models={models}
          galleryModels={galleryModels}
          activeModel={activeModel}
          setActiveModel={setActiveModel}
          heightInCM={heightInCM}
          weightInLBS={weightInLBS}
        />
      </IFrameLayout>
    </IntlProvider>
  )
}

export default ChooseModel

export const getStaticPaths: GetStaticPaths = async () => {
  const { items: stores } = await contentfulService.getStoreList({ enabled: true })

  return {
    paths: stores.map((entry) => ({ params: { storeId: entry.fields.storeId } })),
    fallback: true
  }
}

export const getStaticProps: GetStaticProps<ChooseModelProps> = async ({ params }) => {
  const store = await contentfulService.getStoreByStoreName(params?.storeId as string)
  const models = await contentfulService.getModelList(params?.storeId as string)

  return { props: { store: store?.fields, models }, revalidate: 60, notFound: !store }
}
