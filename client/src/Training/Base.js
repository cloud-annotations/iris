import React, { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import Training from './Training'
import DropDown, { ProfileDropDown } from 'common/DropDown/DropDown'
import { setActiveAccount } from 'redux/accounts'
import { setActiveWMLResource } from 'redux/wmlResources'

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
  resources: state.wmlResources.resources,
  activeResource: state.wmlResources.activeResource,
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
        dispatch(setActiveWMLResource(item))
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

const Base = ({ resources, activeResource }) => {
  useEffect(() => {
    if (activeResource && resources.length > 0) {
      const activeResourceInfo = resources.find(r => r.id === activeResource)

      console.log(activeResourceInfo)

      const url = `/api/proxy/${activeResourceInfo.RegionID}.ml.cloud.ibm.com/v3/models`
      const options = {
        method: 'GET',
        headers: {
          'ML-Instance-ID': activeResource
        }
      }

      fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
    }
  }, [activeResource, resources])

  return (
    <div className={styles.wrapper}>
      <TitleBar />
      <div
        style={{
          position: 'absolute',
          width: PANEL_WIDTH,
          top: '64px',
          bottom: '0',
          background: 'var(--secondaryBg)',
          borderRight: '1px solid var(--border)'
        }}
      >
        <div className={styles.listItem}>
          <div className={styles.listItemText}>model-id</div>
        </div>
        <div className={styles.listItemActive}>
          <div className={styles.listItemText}>model-id</div>
        </div>
        <div className={styles.listItem}>
          <div className={styles.listItemText}>model-id</div>
        </div>
        <div className={styles.listItem}>
          <div className={styles.listItemText}>model-id</div>
        </div>
        <div className={styles.listItem}>
          <div className={styles.listItemText}>model-id</div>
        </div>
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

export default connect(state => ({
  resources: state.wmlResources.resources,
  activeResource: state.wmlResources.activeResource
}))(Base)
