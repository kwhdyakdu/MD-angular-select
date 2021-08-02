// import { Col } from 'react-bootstrap'
import cn from 'classnames'
import Link from 'next/link'
// import Link from 'next/link'
import { useRouter } from 'next/router'
import { Nav } from 'react-bootstrap'
// import { Fragment } from 'react'
import styles from './iframe-nav.module.scss'
import ShirtIcon from '../../../../public/icons/shirt.svg'
// import FittingRoomIcon from '../../../../public/icons/fitting-room.svg'
import PeopleIcon from '../../../../public/icons/people.svg'
// import CartIcon from '../../../../public/icons/cart.svg'
// import IFrameNavTab from './iframe-nav-tab'
import FittingRoomIcon from './fitting-room-icon'

// const ROUTES = [
//   { label: '1. Pick', svg: ShirtIcon, path: '' },
//   { label: '2. Fitting Room', svg: FittingRoomIcon, path: 'fitting-room' },
//   { label: '3. Purchase', svg: CartIcon, path: 'purchase' }
// ]

type IFrameNavProps = {
  className?: string
}

const IFrameNav: React.FC<IFrameNavProps> = ({ className }) => {
  const { query, pathname } = useRouter()

  const splitPathname = pathname.split('/')

  const prePath = splitPathname[splitPathname.length - 2]
  const path = splitPathname[splitPathname.length - 1]
  const isWoocommerce = pathname.split('/')[1] === 'woocommerce'

  const catalogTabIsActive = !path || path === '[storeId]' || prePath === 'product'
  const modelsTabIsActive = path === 'choose-model'
  const fittingRoomIsActive = path === 'fitting-room'

  return (
    <div className={cn(styles.navigationContainer, className)}>
      <div className={cn(styles.navigation, className)}>
        <Nav
          className={cn(styles.tabContainer)}
          fill
          variant="tabs"
          activeKey={`/${isWoocommerce ? 'woocommerce' : 'shopify'}/${query.storeId}${
            !catalogTabIsActive ? `/${path}` : ''
          }`}
          defaultActiveKey={`/${isWoocommerce ? 'woocommerce' : 'shopify'}/${query.storeId}`}
          justify
        >
          <Nav.Item>
            <Link href={`/${isWoocommerce ? 'woocommerce' : 'shopify'}/${query.storeId}`} passHref>
              <Nav.Link>
                <ShirtIcon className={cn(styles.shirtIcon, { [styles.active]: catalogTabIsActive })} />
                <span className={styles.tabSpacer} />
                <span className={cn(styles.navLink, { [styles.active]: catalogTabIsActive })}>Catalog</span>
                <span />
              </Nav.Link>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link href={`/${isWoocommerce ? 'woocommerce' : 'shopify'}/${query.storeId}/choose-model`} passHref>
              <Nav.Link>
                <PeopleIcon className={cn(styles.peopleIcon, { [styles.active]: modelsTabIsActive })} />
                <span className={styles.modelsTabSpacer} />
                <span className={cn(styles.navLink, { [styles.active]: modelsTabIsActive })}>Models</span>
                <span />
              </Nav.Link>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link href={`/${isWoocommerce ? 'woocommerce' : 'shopify'}/${query.storeId}/fitting-room`} passHref>
              <Nav.Link>
                <FittingRoomIcon fittingRoomIsActive={fittingRoomIsActive} />
              </Nav.Link>
            </Link>
          </Nav.Item>
        </Nav>
      </div>
      {/* <div className={cn(styles.navigation, className)}>
        <IFrameNavTab
          label="Catalog"
          icon={<ShirtIcon className={styles.icon} />}
          isActive={['', '[storeId]'].includes(path)}
          path=""
        />
        <IFrameNavTab
          label="Models"
          icon={<PeopleIcon className={cn(styles.peopleIcon)} />}
          isActive={path === 'choose-model'}
          path="choose-model"
          tabSpacerCustomWidth={4}
        />
        <IFrameNavTab
          label="Fitting Room"
          icon={<FittingRoomIcon />}
          isActive={path === 'fitting-room'}
          path="fitting-room"
        />
      </div> */}
    </div>
  )
}

export default IFrameNav
