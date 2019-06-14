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

const cookieCheck = () => {
  const id = setInterval(() => {
    console.log('tic toc')
    validateCookies().catch(error => {
      if (error.message === 'Forbidden') {
        history.push('/login')
      }
    })
  }, 10 * 1000)
  return () => clearInterval(id)
}

const Routing = () => {
  useEffect(cookieCheck)
  const store = createStore(reducers)
  return (
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          {/* With `Switch` there will only ever be one child here */}
          <Route exact path="/" component={Buckets} />
          <Route path="login" component={Login} />
          <Route path="/:bucket" component={App} />
        </Switch>
      </Router>
    </Provider>
  )
}

export default Routing
