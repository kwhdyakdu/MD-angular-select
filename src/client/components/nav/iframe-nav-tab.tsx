// import { Col } from 'react-bootstrap'
import cn from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import styles from './iframe-nav.module.scss'

type IFrameNavTabProps = {
  label: string
  icon: JSX.Element
  isActive: boolean
  path: string
  tabSpacerCustomWidth?: number
}

const IFrameNavTab: React.FC<IFrameNavTabProps> = ({ label, icon, isActive, path, tabSpacerCustomWidth }) => {
  const { query, pathname } = useRouter()

  const isWoocommerce = pathname.split('/')[1] === 'woocommerce'

  return (
    <>
      <div className={cn(styles.tab, { [styles.active]: isActive })}>
        <Link href={`/${isWoocommerce ? 'woocommerce' : 'shopify'}/${query.storeId}/${path}`} passHref>
          <a className={cn(styles.tabLink)}>
            {icon}
            <div
              className={styles.tabSpacer}
              style={{
                width: tabSpacerCustomWidth
              }}
            />
            <h3 className={cn(styles.h3, styles.iconLabel)}>{label}</h3>
          </a>
        </Link>
      </div>
    </>
  )
}

export default IFrameNavTab
