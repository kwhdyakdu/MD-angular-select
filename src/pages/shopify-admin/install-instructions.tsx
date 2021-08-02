import { NextPage } from 'next'
import ShopifyAdminLayout from 'client/layouts/shopify-admin-layout'
import { Card, Link, TextContainer, TextStyle } from '@shopify/polaris'
import { useShopifySession } from 'client/hooks/shopify-admin/use-shopify-session'
import useSWR from 'swr'

const InstallInstructionsPage: NextPage = () => {
  const { authFetch, user } = useShopifySession()
  const { data } = useSWR('/api/shopify/admin/get-main-theme', (url) => authFetch(url).then((res) => res.json()))

  return (
    <ShopifyAdminLayout title="Install instructions - Admin View" isLoading={!data || !user}>
      <Card title="Install instructions" sectioned>
        <TextContainer spacing="loose">
          <p>Please copy the following code snippet:</p>

          <TextStyle variation="code">
            <p style={{ padding: 8 }}>
              {'<div id="modamatch" data-customer-id="{{customer.id}}" data-customer-email="{{customer.email}}"></div>'}
            </p>
          </TextStyle>

          <p>
            Then open your{' '}
            <Link
              url={`https://${user?.shop}/admin/themes/${data?.theme?.id}?key=templates/collection.liquid`}
              external
            >
              Theme settings
            </Link>{' '}
            and paste the snippet where you want the ModaMatch button to appear.
          </p>
        </TextContainer>
      </Card>
    </ShopifyAdminLayout>
  )
}

export default InstallInstructionsPage
