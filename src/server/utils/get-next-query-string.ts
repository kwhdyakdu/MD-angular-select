import { NextApiRequest } from 'next'

export const getNextQueryString = (req: NextApiRequest) => {
  return req.url?.split('?')[1] ?? ''
}
