import querystring, { ParsedUrlQuery } from 'querystring'
import crypto from 'crypto'

/**
 * Taken from koa-shopify-auth
 */
export const validateHmac = (hmac: string, secret: string, query: ParsedUrlQuery) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { hmac: _hmac, signature: _signature, ...map } = query

  const orderedMap = Object.keys(map)
    .sort((value1, value2) => value1.localeCompare(value2))
    .reduce((accum: { [key: string]: any }, key) => {
      accum[key] = map[key]
      return accum
    }, {})

  const message = querystring.stringify(orderedMap)
  const generatedHash = crypto.createHmac('sha256', secret).update(message).digest('hex')

  return safeCompare(generatedHash, hmac)
}

const safeCompare = (stringA: string, stringB: string) => {
  const aLen = Buffer.byteLength(stringA)
  const bLen = Buffer.byteLength(stringB)

  if (aLen !== bLen) {
    return false
  }

  // Turn strings into buffers with equal length
  // to avoid leaking the length
  const buffA = Buffer.alloc(aLen, 0, 'utf8')
  buffA.write(stringA)
  const buffB = Buffer.alloc(bLen, 0, 'utf8')
  buffB.write(stringB)

  return crypto.timingSafeEqual(buffA, buffB)
}

export const validateShopifyWebhookHmac = (signature: string, secret: string, rawBody: Buffer) => {
  const generated_hash = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
  return generated_hash === signature
}

export const validateWoocommerceWebhookHmac = async (signature: string, secret: string, rawBody: Buffer) => {
  const generated_hash = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
  return generated_hash === signature
}
