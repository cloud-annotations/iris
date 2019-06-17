import React, { useEffect } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import App from './App'
import Login from './Login'
import Buckets from './Buckets'
import history from './history'
import { validateCookies } from './Utils'

import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducers from './redux/reducers'

const useCookieCheck = interval => {
  useEffect(() => {
    const id = setInterval(() => {
      try {
        console.log('tic toc')
        validateCookies()
      } catch {
        history.push('/login')
      }
    }, interval)
    return () => clearInterval(id)
  }, [])
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
          <Route path="/login" component={Login} />
          <Route path="/:bucket" component={App} />
        </Switch>
      </Router>
    </Provider>
  )
}

export default Routing
