import mongoose, { Document, Schema } from 'mongoose'

export type CustomerPreferenceType = {
  email: string
  model?: number
}

const CustomerPreferenceSchema = new Schema({
  email: { type: String, required: true, unique: true },
  model: { type: Number, required: false }
})

export const CustomerPreference: mongoose.Model<Document & CustomerPreferenceType> =
  mongoose.models.CustomerPreference || mongoose.model('CustomerPreference', CustomerPreferenceSchema)
