import Document, { Html, Head, Main, NextScript } from 'next/document'

const { NODE_ENV } = process.env

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* React dev tools standalone mode (needed since we are inside an iframe) */}
          {NODE_ENV === 'development' && <script src="http://localhost:8097" />}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
