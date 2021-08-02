import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'
import { CustomerPreference } from 'server/models/customer-preference'

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  .get(async (req, res) => {
    const email = req.query.email?.toString()
    if (!email) {
      return res.status(400).send({ errorCode: 'InvalidParameters', errorMessage: 'Email must be provided' })
    }

    try {
      const preferences = await CustomerPreference.findOne({ email })
      if (!preferences) {
        return res.status(404).send(null)
      }

      return res.send(preferences)
    } catch (err) {
      console.error('Error in api/customer/preferences', err)
      return res.status(500).send({ errorCode: 'UnexpectedError', errorMessage: 'An unexpected error occured' })
    }
  })
  .post(async (req, res) => {
    const email = req.query.email?.toString()
    const { model } = req.body

    if (!email) {
      return res.status(400).send({ errorCode: 'InvalidParameters', errorMessage: 'Email must be provided' })
    }

    try {
      let preferences = await CustomerPreference.findOne({ email })
      if (!preferences) {
        preferences = new CustomerPreference()
        preferences.email = email
      }

      if (model) {
        preferences.model = model
      }

      await preferences.save()

      return res.send(null)
    } catch (err) {
      console.error('Error in api/customer/preferences', err)
      return res.status(500).send({ errorCode: 'UnexpectedError', errorMessage: 'An unexpected error occured' })
    }
  })
