import React, { useEffect, useState } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import App from './App/App'
import Login from './Login/Login'
import Home from './Home/Home'
import Buckets from './Buckets/Buckets'
import history from 'globalHistory'
import { checkLoginStatus } from './Utils'
import { setAccounts } from 'redux/accounts'
import { setResources } from 'redux/resources'
import { setProfile } from 'redux/profile'

const useCookieCheck = interval => {
  useEffect(() => {
    const id = setInterval(() => {
      try {
        console.log('tic toc')
        checkLoginStatus()
      } catch {
        if (history.location.pathname !== '/login') {
          history.push('/login')
        }
      }
    }, interval)
    return () => clearInterval(id)
  }, [interval])
}

const useAccount = dispatch => {
  useEffect(() => {
    try {
      if (history.location.pathname !== '/login') {
        fetch('/api/accounts')
          .then(res => res.json())
          .then(accounts => {
            const account = accounts[0].accountId
            dispatch(
              setAccounts({
                accounts: accounts,
                activeAccount: account
              })
            )
          })
      }
    } catch (error) {
      console.log(error)
    }
  }, [dispatch])
}

const useUpgradeToken = account => {
  const [tokenUpgraded, setTokenUpgraded] = useState(false)
  useEffect(() => {
    setTokenUpgraded(false)
    try {
      if (account && history.location.pathname !== '/login') {
        fetch(`/api/upgrade-token?account=${account}`).then(() => {
          setTokenUpgraded(true)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }, [account])

  return tokenUpgraded
}

const useResourceList = (dispatch, tokenUpgraded) => {
  useEffect(() => {
    try {
      if (tokenUpgraded && history.location.pathname !== '/login') {
        fetch('/api/cos-instances')
          .then(res => res.json())
          .then(json => {
            dispatch(
              setResources({
                resources: json.resources,
                activeResource: json.resources[0].id
              })
            )
          })
      }
    } catch (error) {
      console.log(error)
    }
  }, [dispatch, tokenUpgraded])
}

const useProfile = (dispatch, account) => {
  useEffect(() => {
    if (account && history.location.pathname !== '/login') {
      fetch(`/api/accounts/${account}/users`)
        .then(res => res.json())
        .then(users => {
          dispatch(setProfile(users[0]))
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
        <Route path="/otherlogin" component={Login} />
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
