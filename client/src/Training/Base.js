import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import Training from './Training'
import DropDown, { ProfileDropDown } from 'common/DropDown/DropDown'
import { setActiveAccount } from 'redux/accounts'
import { setActiveResource } from 'redux/resources'

import styles from './TitleBar.module.css'

const PANEL_WIDTH = '270px'

const accountNameForAccount = account => {
  if (account && account.softlayer) {
    return `${account.softlayer} - ${account.name}`
  } else if (account) {
    return account.name
  }
}

const mapStateToProps = state => ({
  resources: state.resources.resources,
  activeResource: state.resources.activeResource,
  accounts: state.accounts.accounts,
  activeAccount: state.accounts.activeAccount,
  buckets: state.buckets,
  profile: state.profile
})

const TitleBar = connect(mapStateToProps)(
  ({
    profile,
    resources,
    activeResource,
    accounts,
    activeAccount,
    dispatch
  }) => {
    const handleAccountChosen = useCallback(
      item => {
        dispatch(setActiveAccount(item))
      },
      [dispatch]
    )

    const handleResourceChosen = useCallback(
      item => {
        dispatch(setActiveResource(item))
      },
      [dispatch]
    )

    const activeAccountObject = accounts.find(
      account => activeAccount === account.accountId
    )

    const activeResourceObject = resources.find(
      resource => activeResource === resource.id
    )

    return (
      <div className={styles.titleBar}>
        <div className={styles.title}>
          <span className={styles.titlePrefix}>IBM</span>&nbsp;&nbsp;Cloud
          Annotations
          <span className={styles.breadCrumb}>|</span>
          Training
        </div>
        <DropDown
          active={activeResourceObject && activeResourceObject.name}
          list={resources.map(resource => ({
            display: resource.name,
            id: resource.id
          }))}
          onChosen={handleResourceChosen}
        />
        <DropDown
          active={accountNameForAccount(activeAccountObject)}
          list={accounts.map(account => ({
            display: accountNameForAccount(account),
            id: account.accountId
          }))}
          onChosen={handleAccountChosen}
        />
        <ProfileDropDown profile={profile} />
      </div>
    )
  }
)

const Base = () => {
  return (
    <div className={styles.wrapper}>
      <TitleBar />
      <div
        style={{
          position: 'absolute',
          width: PANEL_WIDTH,
          top: '0',
          bottom: '0',
          background: 'var(--secondaryBg)'
        }}
      >
        <div>model-id</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: PANEL_WIDTH,
          width: `calc(100% - ${PANEL_WIDTH})`
        }}
      >
        <Training />
      </div>
    </div>
  )
}

export default Base
