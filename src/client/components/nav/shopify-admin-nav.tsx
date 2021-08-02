import { Navigation } from '@shopify/polaris'
import { useRouter } from 'next/router'

const ShopifyAdminNav: React.FC = () => {
  const { pathname } = useRouter()

  return (
    <Navigation location={pathname}>
      <Navigation.Section
        items={[
          { url: '/shopify-admin/install-instructions', label: 'Install Instructions' },
          { url: '/shopify-admin/settings', label: 'Settings' }
        ]}
      />
    </Navigation>
  )
}

export default ShopifyAdminNav
