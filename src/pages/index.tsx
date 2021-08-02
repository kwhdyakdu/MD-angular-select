import useSWR from 'swr'
import { NextPage } from 'next'
import { IntlProvider, FormattedMessage } from 'react-intl'
import Button from 'react-bootstrap/Button'
import BaseLayout from 'client/layouts/base-layout'

const fetcher = async (url: string) => {
  return fetch(url).then((r) => r.json())
}

// Translated messages in French with matching IDs to what you declared
const messagesInFrench = {
  myButton: 'Mon bouton'
}

const IndexPage: NextPage = () => {
  const { data, error } = useSWR('/api/random-quote', fetcher)

  // The following line has optional chaining, added in Next.js v9.1.5,
  // is the same as `data && data.author` testing
  const author = data?.author
  let quote = data?.quote

  if (!data) quote = 'Loading...'
  if (error) quote = 'Failed to fetch the quote.'

  return (
    // Uncomment for French
    // <IntlProvider messages={messagesInFrench} defaultLocale="en" locale="fr" >
    <IntlProvider defaultLocale="en" locale="en">
      <BaseLayout title="IFrame - Admin View">
        <ul>
          <li className="quote">{quote}</li>
          <li>{author && <span className="author">-{author}</span>}</li>
          <Button variant="primary">
            <FormattedMessage id="myButton" defaultMessage="My Button" />
          </Button>
        </ul>
      </BaseLayout>
    </IntlProvider>
  )
}

export default IndexPage
