import mongoose, { Document, Schema } from 'mongoose'
import { IProduct } from 'shopify-api-node'

export type ProductType = {
  type: string
  shopName: string
  externalId: number
  short_description?: string
  description?: string
  contentfulId?: string
  contentfulCategoryId?: string
  title?: string
  price?: number
  imageUrl?: string
  shopifyData?: IProduct
  enabled?: boolean
  mainImageUrl?: string
  additionalImages?: (string | undefined)[]
}

const ProductSchema = new Schema({
  type: { type: String, required: true },
  shopName: { type: String, required: true },
  externalId: { type: Number, required: true },
  short_description: { type: String, required: false },
  description: { type: String, required: false },
  contentfulId: { type: String, required: false },
  contentfulCategoryId: { type: String, required: false },
  title: { type: String, required: false },
  price: { type: Number, required: false },
  imageUrl: { type: String, required: false },
  shopifyData: { type: Object, required: false },
  enabled: { type: Boolean, required: false },
  mainImageUrl: { type: String, required: false },
  additionalImages: { type: Array, required: false }
})

ProductSchema.methods.toJSON = function toJson() {
  const obj = this.toObject()
  delete obj._id
  return obj
}

export const Product: mongoose.Model<Document & ProductType> =
  mongoose.models.Product || mongoose.model('Product', ProductSchema)
