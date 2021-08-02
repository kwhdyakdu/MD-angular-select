import { NextApiRequest } from 'next'

export const parseBody = (req: NextApiRequest) =>
  new Promise<Buffer>((resolve) => {
    let buffer = ''
    req.on('data', (chunk) => {
      buffer += chunk
    })

    req.on('end', () => {
      resolve(Buffer.from(buffer))
    })
  })
