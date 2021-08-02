import mongoose, { Document, Schema } from 'mongoose'

export type FeedbackFormType = {
  storeId: string
  feedbackValue: string
  email: string
  message: string
}

const FeedbackFormSchema = new Schema({
  storeId: { type: String, required: true },
  feedbackValue: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true }
})

export const FeedbackForm: mongoose.Model<Document & FeedbackFormType> =
  mongoose.models.FeedbackForm || mongoose.model('FeedbackForm', FeedbackFormSchema)
