import { useCallback, useMemo } from 'react'
import { authenticatedFetch } from '@shopify/app-bridge-utils'
import { useAppBridge } from '@shopify/app-bridge-react'
import { Redirect } from '@shopify/app-bridge/actions'
import { useRouter } from 'next/router'
import querystring from 'querystring'
import useSWR from 'swr'

export const useShopifySession = () => {
  const { query } = useRouter()
  const { data: user } = useSWR<
    { userId: string; exp: number; shop: string },
    { errorCode: string; errorMessage: string }
  >('/api/shopify/admin/validate-token', (url) =>
    authFetch(url).then(async (res) => {
      if (res.ok) {
        return res.json()
      }
      throw await res.json()
    })
  )

  const app = useAppBridge()
  const authFetch = useMemo(() => authenticatedFetch(app), [app])

  const initOAuthFlow = useCallback(() => {
    const apiUrl = window.location.origin
    const oauthUrl = `${apiUrl}/api/auth/shopify?${querystring.encode(query)}`

    // If we are outside an iframe, we just redirect to the oauth flow start
    if (window.top === window.self) {
      window.location.assign(oauthUrl)
    } else {
      // we are inside an iframe and need to change the url with Shopify App Bridge's Redirect action
      Redirect.create(app).dispatch(Redirect.Action.REMOTE, oauthUrl)
    }
  }, [app, query])

  return {
    authFetch,
    initOAuthFlow,
    user
  }
}
