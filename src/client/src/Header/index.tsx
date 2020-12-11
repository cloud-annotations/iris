import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router-dom'

import { AppBar, Tab, Tabs, Divider, Toolbar } from '@material-ui/core'

import DropDown, { ProfileDropDown } from 'common/DropDown/DropDown'

import styles from './Buckets.module.css'

import { setActiveAccount } from 'redux/accounts'
import { IrisLogo } from './IrisLogo'

const accountNameForAccount = (account: any) => {
  if (account && account.softlayer) {
    return `${account.softlayer} - ${account.name}`
  } else if (account) {
    return account.name
  }
}

const tabs = [
  { name: 'Buckets', path: '/buckets' },
  { name: 'Training runs', path: '/training' },
  // { name: 'Deployments', path: '/deployments' },
]

function Header() {
  const accounts = useSelector((state: any) => state.accounts.accounts)
  const activeAccount = useSelector(
    (state: any) => state.accounts.activeAccount
  )
  const profile = useSelector((state: any) => state.profile)

  const dispatch = useDispatch()

  const handleAccountChosen = useCallback(
    (item) => {
      dispatch(setActiveAccount(item))
    },
    [dispatch]
  )

  const activeAccountObject = accounts.find(
    (account: any) => activeAccount === account.accountId
  )

  const { pathname } = useLocation()

  const value = tabs.findIndex((t) => t.path === pathname)

  const history = useHistory()

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar disableGutters>
          <IrisLogo
            style={{ marginLeft: '32px', width: '20px', height: '20.5px' }}
          />

          <div className={styles.title}>Cloud Annotations</div>
          <nav className={styles.mainLinks}>
            <a className={styles.link} href="https://cloud.annotations.ai/docs">
              Docs
            </a>
            <a
              className={styles.link}
              href="https://cloud.annotations.ai/workshops"
            >
              Workshops
            </a>
            <a
              className={styles.link}
              href="https://cloud.annotations.ai/demos"
            >
              Demos
            </a>
            <a className={styles.link} href="https://cloud.annotations.ai/sdks">
              SDKs
            </a>
          </nav>

          <DropDown
            active={accountNameForAccount(activeAccountObject)}
            list={accounts.map((account: any) => ({
              display: accountNameForAccount(account),
              id: account.accountId,
            }))}
            onChosen={handleAccountChosen}
          />
          <ProfileDropDown profile={profile} />
          {/* </div> */}
        </Toolbar>
      </AppBar>
      <AppBar position="sticky">
        <Tabs
          value={value}
          onChange={(_, newValue) => {
            history.replace(tabs[newValue].path)
          }}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((t) => (
            <Tab
              label={t.name}
              style={{
                minWidth: 0,
                paddingLeft: 12,
                paddingRight: 12,
              }}
            />
          ))}
        </Tabs>
        <Divider />
      </AppBar>
    </React.Fragment>
  )
}

export default Header
