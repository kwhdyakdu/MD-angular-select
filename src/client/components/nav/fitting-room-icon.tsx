// import { Col } from 'react-bootstrap'
import cn from 'classnames'
// import { useRouter } from 'next/router'
// import { Fragment } from 'react'
import { useCustomerSettings } from 'client/hooks/use-customer-settings'
import styles from './iframe-nav.module.scss'
import Icon from '../../../../public/icons/fitting-room.svg'

type FittingRoomIconProps = {
  fittingRoomIsActive: boolean
  // className?: string
}

const FittingRoomIcon: React.FC<FittingRoomIconProps> = ({ fittingRoomIsActive }) => {
  // const { pathname } = useRouter()

  const { fittingItems } = useCustomerSettings()

  // const isWoocommerce = pathname.split('/')[1] === 'woocommerce'

  // const isOnFittingRoomPath = pathname.endsWith('/fitting-room')

  return (
    <div className={cn(styles.fittingRoomTabContents)}>
      <div className={cn(styles.navLink, { [styles.active]: fittingRoomIsActive })}>Fitting Room</div>
      <div className={cn(styles.spacer)} />
      <div className={cn(styles.iconContainer)}>
        <Icon className={cn(styles.fittingRoomIcon, { [styles.active]: fittingRoomIsActive })} />
        {fittingItems.length > 0 && (
          <div className={styles.counterBadge}>
            <div className={styles.counterBadgeText}>{String(fittingItems.length)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FittingRoomIcon
