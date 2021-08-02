import React, { useCallback } from 'react'
import Head from 'next/head'
import { useShopifyEmbed } from 'client/hooks/use-shopify-embed.hook'
import { useCustomerSettings } from 'client/hooks/use-customer-settings'
import { SHOPIFY_MESSAGE_TYPE } from 'types/shopify-embed.types'
import { Store } from 'types/contenful.types'
import IFrameNav from 'client/components/nav/iframe-nav'
import FeedbackPopup from 'client/components/feedback-popup/feedback-popup'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/pro-regular-svg-icons'
import { useRouter } from 'next/router'
import { CartItem } from 'types/modamatch.types'
import Link from 'next/link'
import CartIcon from '../../../public/icons/cart.svg'

import ThemeOverride from './theme-override'
import styles from './iframe-layout.module.scss'

// global styles
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-image-gallery/styles/css/image-gallery.css'
import 'rc-slider/assets/index.css'

type IFrameLayoutProps = {
  title: string
  store: Store
}

type IFrameSidebarLayoutProps = IFrameLayoutProps & {
  hasSidebar: true
  children: React.ReactNode[]
}

type IFrameNoSidebarLayoutProps = IFrameLayoutProps & {
  hasSidebar?: false
}

const IFrameLayout: React.FC<IFrameNoSidebarLayoutProps | IFrameSidebarLayoutProps> = ({
  title,
  children,
  store,
  hasSidebar
}) => {
  const { query, pathname } = useRouter()

  const { postMessage } = useShopifyEmbed()
  const { cartItems } = useCustomerSettings()

  const [showFeedbackPopup, setShowFeedbackPopup] = React.useState(false)
  const toggleFeedbackPopup = useCallback(() => setShowFeedbackPopup(!showFeedbackPopup), [showFeedbackPopup])

  const splitPathName = pathname.split('/')

  const isWoocommerce = splitPathName[1] === 'woocommerce'

  const itemCountSum = cartItems?.reduce((total: number, cartItem: CartItem) => total + (cartItem.qty ?? 1), 0)

  const viewCartText = cartItems.length > 0 ? `View Cart (${itemCountSum})` : 'View Cart'

  const isShoppingCart = splitPathName[splitPathName.length - 1] === 'purchase'

  const isFittingRoom = splitPathName[splitPathName.length - 1] === 'fitting-room'

  const containerStyle = isFittingRoom ? styles.fittingRoomContainer : styles.container

  return (
    <>
      {/* Mobile is not compatible yet, so display error message for small screens */}
      <div className={cn(containerStyle, 'd-sm-none', 'd-block')} style={{ gridTemplateRows: '50px 1fr' }}>
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => postMessage(SHOPIFY_MESSAGE_TYPE.CLOSE)}
            >
              <FontAwesomeIcon icon={faTimes} fixedWidth />
            </button>
          </div>
        </div>

        <div className="p-2 mt-3 text-center">
          <h1 className={cn(styles.h1, 'mb-3')}>Hey, thanks for visiting :)</h1>
          <p>
            Sorry, but we are currently only available for desktop/laptop use!
            <br /> Mobile compatibility coming soon!
          </p>
        </div>

        <div className={cn(styles.mobileModePreviewGifContainer, 'p-2', 'mt-3')}>
          <img className={cn(styles.mobileModePreviewGif)} src="/images/preview.gif" alt="" />
        </div>
      </div>

      {/* Non mobile layout */}
      <div className={cn(containerStyle, !hasSidebar && styles.fullWidth)}>
        <Head>
          <link rel="icon" href="/favicon.png" />
          <title>
            {title}
            {' · ModaMatch'}
          </title>
        </Head>
        <ThemeOverride store={store} />

        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <div className={styles.rightSection}>
              <div className={cn(styles.viewCartLinkSection, { [styles.active]: isShoppingCart })}>
                <Link href={`/${isWoocommerce ? 'woocommerce' : 'shopify'}/${query.storeId}/purchase`} passHref>
                  <a className={cn(styles.viewCartLink)}>
                    <CartIcon />
                    <div className={styles.viewCartLinkSpacer} />
                    <h3 className={cn(styles.h3, styles.viewCartLinkLabel)}>{viewCartText}</h3>
                  </a>
                </Link>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => postMessage(SHOPIFY_MESSAGE_TYPE.CLOSE)}
              >
                <FontAwesomeIcon icon={faTimes} fixedWidth />
              </button>
            </div>
          </div>
          <IFrameNav />
        </div>

        {hasSidebar ? (
          <>
            <div className={styles.sideColumn}>{(children as any)[0]}</div>
            <main className={styles.mainColumn}>{(children as any)[1]}</main>
          </>
        ) : (
          <main className={cn(styles.mainColumn)}>{children}</main>
        )}
        <div className={styles.poweredByMM}>
          {(children as any)[2]}
          Powered by Moda Match&#8482;
        </div>
        <FeedbackPopup showFeedbackPopup={showFeedbackPopup} toggleFeedbackPopup={toggleFeedbackPopup} store={store} />
      </div>
    </>
  )
}

export default IFrameLayout
