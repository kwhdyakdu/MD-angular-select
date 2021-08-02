import { Heading } from '@shopify/polaris'
import ShopifyAdminLayout from 'client/layouts/shopify-admin-layout'
import { NextPage } from 'next'

const AdminNoPermissionsPage: NextPage = () => {
  return (
    <ShopifyAdminLayout title="No Permission" navHidden>
      <Heading>No Permissions</Heading>
      <p>
        Sorry, this store hasn&apos;t been enabled. Please contact ModaMatch Support if you would like to get invited.
      </p>
    </ShopifyAdminLayout>
  )
}

export default AdminNoPermissionsPage
