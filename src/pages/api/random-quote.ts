import { NextApiRequest, NextApiResponse } from 'next'
import { commonMiddlewares } from 'server/middlewares'
import nextConnect from 'next-connect'

export default nextConnect<NextApiRequest, NextApiResponse>()
  .use(commonMiddlewares)
  .get((req, res) => {
    res.status(200).json({
      quote: '** Write tests, not too many, mostly integrations :)',
      author: 'Zeermo Ranch'
    })
  })
