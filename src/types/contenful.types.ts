import { Asset, Entry } from 'contentful'

export type Store = {
  storeId: string
  storeType: boolean
  enabled: boolean
  primaryColor: string
  secondaryColor: string
  secretKey: string
  shopifyClientId: string
  shopifyApiSecret: string
  
}

export type Size = {
  name: string
  value: number
}

export type Model = {
  name: string
  profilePicture: Asset
  modelPictures: Asset[]
  weight: number
  height: number
  chest: number
  neck: number
  waist: number
  hip: number
  thighs: number
  size?: Entry<Size>
}

export type GalleryModel = {
  model: Entry<Model>
  index: number
}

export type Item = {
  product: string
  category: Entry<Category>
  store: Entry<Store>
  shopifyId?: string
  mainThumbnail: Asset
  additionalPhotos: Asset[]
}

export type Category = {
  storeId: string
  category: string
  typeOfClothing?: Number
}

export type TryOnItem = {
  model: Entry<Model>[]
  item: Entry<Item>
  itemLayer: Asset
  itemLayerBack: Asset
  size?: Entry<Size>
}
