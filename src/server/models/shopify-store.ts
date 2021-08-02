import mongoose, { Document, Schema } from 'mongoose'

export type ShopifyStoreType = {
  shopName: string
  accessToken: string
}

const ShopifyStoreSchema = new Schema({
  shopName: { type: String, required: true },
  accessToken: { type: String, required: true }
})

export const ShopifyStore: mongoose.Model<Document & ShopifyStoreType> =
  mongoose.models.ShopifyStore || mongoose.model('ShopifyStore', ShopifyStoreSchema)
