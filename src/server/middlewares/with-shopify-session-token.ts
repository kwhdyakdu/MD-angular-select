import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { RequestHandler } from 'next-connect'

const { SHOPIFY_CLIENT_SECRET = '' } = process.env

export type ShopifySessionApiRequest = NextApiRequest & {
  sessionToken: {
    iss: string
    dest: string
    aud: string
    sub: string
    exp: number
    nbf: number
    iat: number
    jti: string
    sid: string
  }
  shopDomain: string
  shopName: string
}

export const withShopifySessionToken: RequestHandler<ShopifySessionApiRequest, NextApiResponse> = async (
  req,
  res,
  next
) => {
  const token = req.headers.authorization?.replace(/Bearer /, '') ?? ''

  try {
    const decoded = jwt.verify(token, SHOPIFY_CLIENT_SECRET) as any

    req.sessionToken = decoded
    req.shopDomain = decoded.dest
    req.shopName = decoded.dest.replace('https://', '')

    return next()
  } catch (err) {
    return res.status(401).json({ errorCode: 'InvalidToken', errorMessage: err.message })
  }
}
