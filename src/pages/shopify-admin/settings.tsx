import { NextPage } from 'next'
import ShopifyAdminLayout from 'client/layouts/shopify-admin-layout'
import { useShopifySession } from 'client/hooks/shopify-admin/use-shopify-session'

type SettingsPageProps = {}

const SettingsPage: NextPage<SettingsPageProps> = () => {
  useShopifySession()

  return <ShopifyAdminLayout title="Settings">Coming soon</ShopifyAdminLayout>
}

export default SettingsPage
