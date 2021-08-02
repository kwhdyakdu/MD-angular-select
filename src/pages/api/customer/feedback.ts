import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { FeedbackForm } from 'server/models/feedback'

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  // admin get call to receive all customer feedback as json (password protected)
  .get(async (req, res) => {
    if (!process.env.ADMIN_PASSWORD) {
      return res
        .status(400)
        .send({ errorCode: 'ConfigurationError', errorMessage: "ADMIN_PASSWORD wasn't provided in environment" })
    }

    const password = req.query.password?.toString()
    if (!password) {
      return res.status(400).send({ errorCode: 'InvalidParameters', errorMessage: 'Password must be provided' })
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).send({ errorCode: 'InvalidParameters', errorMessage: 'Password is incorrect' })
    }

    try {
      const feedbackList = await FeedbackForm.find({})
      return res.send(feedbackList)
    } catch (err) {
      console.error('Error in api/customer/feedback', err)
      return res.status(500).send({ errorCode: 'UnexpectedError', errorMessage: 'An unexpected error occured' })
    }
  })
  // customer post call to save new feedback to the db
  .post(async (req, res) => {
    const { storeId, feedbackValue, message, email } = req.body

    if (!email || !storeId || !feedbackValue || !message) {
      return res.status(400).send({ errorCode: 'InvalidParameters', errorMessage: 'All values must be provided' })
    }

    try {
      const feedback = new FeedbackForm()
      feedback.storeId = storeId
      feedback.feedbackValue = feedbackValue
      feedback.message = message
      feedback.email = email

      await feedback.save()

      return res.send(null)
    } catch (err) {
      console.error('Error in api/customer/feedback', err)
      return res.status(500).send({ errorCode: 'UnexpectedError', errorMessage: 'An unexpected error occured' })
    }
  })
