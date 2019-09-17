import React, { useEffect, useState, useCallback } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import App from './App/App'
import Home from './Home/Home'
import Buckets from './Buckets/Buckets'
import history from 'globalHistory'
import { checkLoginStatus } from './Utils'
import { setAccounts, setLoadingAccounts } from 'redux/accounts'
import { setResources, setLoadingResources } from 'redux/resources'
import { setProfile } from 'redux/profile'

const useCookieCheck = interval => {
  useEffect(() => {
    const cookieCheck = () => {
      try {
        console.log('tic toc')
        checkLoginStatus()
      } catch {
        if (history.location.pathname !== '/login') {
          history.push('/login')
        }
      }
    }
    cookieCheck()
    const id = setInterval(cookieCheck, interval)
    return () => clearInterval(id)
  }, [interval])
}

const useAccount = dispatch => {
  const loadAccounts = useCallback(() => {
    console.log('loading accounts')
    dispatch(setLoadingAccounts(true))
    fetch('/api/accounts')
      .then(res => res.json())
      .then(accounts => {
        const [firstAccount] = accounts
        dispatch(
          setAccounts({
            accounts: accounts,
            activeAccount: firstAccount && firstAccount.accountId
          })
        )
        dispatch(setLoadingAccounts(false))
        if (accounts.length === 0) {
          setTimeout(() => {
            loadAccounts()
          }, 15000)
        }
      })
      .catch(error => {
        console.error(error)
      })
  }, [dispatch])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])
}

const useUpgradeToken = account => {
  const [tokenUpgraded, setTokenUpgraded] = useState(false)
  useEffect(() => {
    setTokenUpgraded(false)
    if (account) {
      fetch(`/api/upgrade-token?account=${account}`)
        .then(() => {
          setTokenUpgraded(true)
        })
        .catch(error => {
          console.error(error)
        })
    }
  }, [account])

  return tokenUpgraded
}

const useResourceList = (dispatch, tokenUpgraded) => {
  const loadResources = useCallback(() => {
    console.log('loading resources')
    dispatch(setLoadingResources(true))
    fetch('/api/cos-instances')
      .then(res => res.json())
      .then(json => {
        const { resources } = json
        const [firstResource] = resources
        dispatch(
          setResources({
            resources: resources,
            activeResource: firstResource && firstResource.id
          })
        )
        dispatch(setLoadingResources(false))
        if (resources.length === 0) {
          setTimeout(() => {
            loadResources()
          }, 15000)
        }
      })
      .catch(error => {
        console.error(error)
      })
  }, [dispatch])

  useEffect(() => {
    if (tokenUpgraded) {
      loadResources()
    }
  }, [loadResources, tokenUpgraded])
}

const useProfile = (dispatch, account) => {
  useEffect(() => {
    if (account) {
      fetch('/auth/userinfo')
        .then(res => res.text())
        .then(userId => fetch(`/api/accounts/${account}/users/${userId}`))
        .then(res => res.json())
        .then(user => {
          dispatch(setProfile(user))
        })
        .catch(error => {
          console.error(error)
        })
    }
  }, [account, dispatch])
}

const Routing = ({ dispatch, activeAccount }) => {
  useCookieCheck(10 * 1000)
  useAccount(dispatch)
  const tokenUpgraded = useUpgradeToken(activeAccount)
  useResourceList(dispatch, tokenUpgraded)
  useProfile(dispatch, activeAccount)

  return (
    <Router history={history}>
      <Switch>
        {/* With `Switch` there will only ever be one child here */}
        <Route exact path="/" component={Buckets} />
        {/* <Route path="/otherlogin" component={Login} /> */}
        <Route path="/login" component={Home} />
        <Route path="/:bucket" component={App} />
      </Switch>
    </Router>
  )
}

const mapStateToProps = state => ({
  activeAccount: state.accounts.activeAccount
})
export default connect(mapStateToProps)(Routing)
