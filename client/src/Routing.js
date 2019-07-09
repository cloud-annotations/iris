import React, { useEffect } from 'react'
import { Router, Route, Switch } from 'react-router-dom'

import App from './App/App'
import Login from './Login/Login'
import Home from './Home/Home'
import Buckets from './Buckets/Buckets'
import history from 'globalHistory'
import { checkLoginStatus } from './Utils'

import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducers from './redux/reducers'

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

const Routing = () => {
  useCookieCheck(10 * 1000)
  const store = createStore(reducers)
  return (
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          {/* With `Switch` there will only ever be one child here */}
          <Route exact path="/" component={Buckets} />
          <Route path="/otherlogin" component={Login} />
          <Route path="/login" component={Home} />
          <Route path="/:bucket" component={App} />
        </Switch>
      </Router>
    </Provider>
  )
}

export default Routing
