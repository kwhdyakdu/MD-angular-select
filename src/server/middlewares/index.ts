import nc from 'next-connect'
import { connectToDatabaseMiddleware } from './connect-to-database'

export const commonMiddlewares = nc().use(connectToDatabaseMiddleware)
