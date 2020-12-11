import React, { useEffect, useState, useCallback } from 'react'
import { Router, Route, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import App from './App/App'
import Buckets from './Buckets/Buckets'
import Training from './Training'
import Deployments from './Deployments'

import history from 'globalHistory'

import { setAccounts, setLoadingAccounts } from 'redux/accounts'
import {
  setResources,
  setLoadingResources,
  invalidateResources,
} from 'redux/resources'
import {
  setWMLResources,
  setLoadingWMLResources,
  invalidateWMLResources,
} from 'redux/wmlResources'
import { setProfile } from 'redux/profile'
import Header from 'Header'

const useAccount = (dispatch) => {
  const loadAccounts = useCallback(
    (tries = 0) => {
      fetch('/api/accounts')
        .then((res) => res.json())
        .then((accounts) => {
          dispatch(setAccounts(accounts))
          dispatch(setLoadingAccounts(false))
          if (accounts.length === 0 && tries < 300) {
            setTimeout(() => {
              loadAccounts(tries + 1)
            }, 10000)
          }
        })
        .catch((error) => {
          console.error(error)
        })
    },
    [dispatch]
  )

  useEffect(() => {
    dispatch(setLoadingAccounts(true))
    loadAccounts()
  }, [dispatch, loadAccounts])
}

const useUpgradeToken = (account) => {
  const [tokenUpgraded, setTokenUpgraded] = useState(false)
  useEffect(() => {
    setTokenUpgraded(false)
    if (account) {
      fetch(`/api/upgrade-token?account=${account}`)
        .then(() => {
          setTokenUpgraded(account)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [account])

  return tokenUpgraded
}

const recursivelyFetchResources = async (url, oldResources) => {
  if (url) {
    const trimmed = url.replace(/^\/v2\/resource_instances/, '')
    const json = await fetch(`/api/cos-instances${trimmed}`).then((r) =>
      r.json()
    )
    const { next_url, resources } = json
    return recursivelyFetchResources(next_url, [...oldResources, ...resources])
  }
  return oldResources
}

const useResourceList = (dispatch, tokenUpgraded) => {
  useEffect(() => {
    let isCancelled = false
    const loadResources = (tries = 0) => {
      fetch('/api/cos-instances')
        .then((res) => res.json())
        .then((json) =>
          recursivelyFetchResources(json.next_url, json.resources)
        )
        .then((allResources) => {
          if (!isCancelled) {
            // Alphabetize the list by name.
            allResources.sort((a, b) =>
              a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
            )

            dispatch(setResources(allResources))
            dispatch(setLoadingResources(false))
            if (allResources.length === 0 && tries < 300) {
              setTimeout(() => {
                loadResources(tries + 1)
              }, 10000)
            }
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }

    if (tokenUpgraded) {
      dispatch(invalidateResources(true))
      loadResources()
    }
    return () => {
      isCancelled = true
    }
  }, [dispatch, tokenUpgraded])
}

const recursivelyFetchWMLResources = async (url, oldResources) => {
  if (url) {
    const trimmed = url.replace(/^\/v2\/resource_instances/, '')
    const json = await fetch(`/api/wml-instances${trimmed}`).then((r) =>
      r.json()
    )
    const { next_url, resources } = json
    return recursivelyFetchWMLResources(next_url, [
      ...oldResources,
      ...resources,
    ])
  }
  return oldResources
}

const useWMLResourceList = (dispatch, tokenUpgraded) => {
  const loadWMLResources = useCallback(
    (tries = 0) => {
      fetch('/api/wml-instances')
        .then((res) => res.json())
        .then((json) =>
          recursivelyFetchWMLResources(json.next_url, json.resources)
        )
        .then((allResources) => {
          // Alphabetize the list by name.
          allResources.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          )

          dispatch(setWMLResources(allResources))
          dispatch(setLoadingWMLResources(false))
          if (allResources.length === 0 && tries < 300) {
            setTimeout(() => {
              loadWMLResources(tries + 1)
            }, 10000)
          }
        })
        .catch((error) => {
          console.error(error)
        })
    },
    [dispatch]
  )

  useEffect(() => {
    if (tokenUpgraded) {
      dispatch(invalidateWMLResources(true))
      loadWMLResources()
    }
  }, [dispatch, loadWMLResources, tokenUpgraded])
}

const useProfile = (dispatch, account) => {
  useEffect(() => {
    if (account) {
      fetch('/auth/userinfo')
        .then((res) => res.text())
        .then((userId) => fetch(`/api/accounts/${account}/users/${userId}`))
        .then((res) => res.json())
        .then((user) => {
          dispatch(setProfile(user))
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [account, dispatch])
}

const Routing = ({ dispatch, activeAccount }) => {
  useAccount(dispatch)
  useEffect(() => {
    if (activeAccount) {
      dispatch(invalidateResources())
    }
  }, [activeAccount, dispatch])
  const tokenUpgraded = useUpgradeToken(activeAccount)
  useResourceList(dispatch, tokenUpgraded)
  useWMLResourceList(dispatch, tokenUpgraded)
  useProfile(dispatch, activeAccount)

  return (
    <Router history={history}>
      <Route exact path="/(buckets|training|deployments)">
        <Header />
      </Route>
      <Switch>
        <Route exact path="/">
          <Redirect to="/buckets" />
        </Route>
        <Route exact path="/buckets">
          <Buckets />
        </Route>
        <Route exact path="/training">
          <Training />
        </Route>
        <Route exact path="/deployments">
          <Deployments />
        </Route>
        <Route exact path="/buckets/:bucket">
          <App />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  )
}

const mapStateToProps = (state) => ({
  activeAccount: state.accounts.activeAccount,
})
export default connect(mapStateToProps)(Routing)
