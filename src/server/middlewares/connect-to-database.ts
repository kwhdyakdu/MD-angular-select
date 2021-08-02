import mongoose from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'
import { RequestHandler } from 'next-connect'

const { MONGODB_URI = '' } = process.env

const connection: { isConnected?: number } = {} /* creating connection object */

/* connecting to our database */
export const connectToDatabase = async () => {
  if (connection.isConnected) {
    return null
  }

  const db = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })

  connection.isConnected = db.connections[0].readyState

  return db
}

export const connectToDatabaseMiddleware: RequestHandler<NextApiRequest, NextApiResponse> = async (req, res, next) => {
  if (connection.isConnected) {
    return next()
  }

  await connectToDatabase()

  return next()
}
