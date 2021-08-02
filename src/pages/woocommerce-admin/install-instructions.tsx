import { NextPage } from 'next'
import Head from 'next/head'
import BaseLayout from 'client/layouts/base-layout'
import { Card } from 'react-bootstrap'
import { IntlProvider } from 'react-intl'

const iframeResizerStyles = `
  html, body, body > div {
    height: auto !important;
  }
`

const InstallInstructionsPage: NextPage = () => {
  return (
    <IntlProvider defaultLocale="en" locale="en">
      <Head>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.contentWindow.min.js"
          integrity="sha512-qw2bX9KUhi7HLuUloyRsvxRlWJvj0u0JWVegc5tf7qsw47T0pwXZIk1Kyc0utTH3NlrpHtLa4HYTVUyHBr9Ufg=="
          crossOrigin="anonymous"
        />
        <style>{iframeResizerStyles}</style>
      </Head>
      <BaseLayout title="Install instructions">
        <div className="py-4">
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Install Instructions</Card.Title>
              <Card.Text>Only one option should be selected. Each page will only display one button.</Card.Text>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>OPTION 1 - Theme method</Card.Title>
              <Card.Text>Please copy the following code snippet:</Card.Text>
              <Card.Text>
                <code>{'<button class="modamatch">Virtual try on with Moda-match</button>'}</code>
              </Card.Text>
              <Card.Text>
                Then on your wordpress admin menu, open your &apos;Appearance&apos; -&gt; &apos;Theme Editor&apos; and
                paste the snippet where you want the Modamatch button to appear.
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>OPTION 2 - Shortcode method</Card.Title>
              <Card.Text>Please copy the following shortcode:</Card.Text>
              <Card.Text>
                <code>[modamatch]Virtual try on with Moda-match[/modamatch]</code>
              </Card.Text>
              <Card.Text>
                Then on your wordpress admin menu, open up any content&apos;s input field (page body, post body, menu,
                widget body, product descriptions, etc) and paste the shortcode where you want the Modamatch button to
                appear.
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </BaseLayout>
    </IntlProvider>
  )
}

export default InstallInstructionsPage
