import { NextPage } from 'next'
import ShopifyAdminLayout from 'client/layouts/shopify-admin-layout'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useShopifySession } from 'client/hooks/shopify-admin/use-shopify-session'

const ShopifyAdminIndexPage: NextPage = () => {
  const { initOAuthFlow } = useShopifySession()

  const router = useRouter()
  useEffect(() => {
    // if we are inside the iframe we redirect to the install instructions
    if (window.top !== window.self) {
      router.replace('/shopify-admin/install-instructions')
    } else {
      // if we are outside the iframe, we need to start the oauth flow
      // this is probably a first time installation
      initOAuthFlow()
    }
  }, [router, initOAuthFlow])

  return <ShopifyAdminLayout title="Setup" isLoading navHidden />
}

export default ShopifyAdminIndexPage
