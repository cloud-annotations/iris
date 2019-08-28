import React from 'react'
import ReactDOM from 'react-dom'
import GoogleAnalytics from 'react-ga'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'

import Routing from './Routing'
import { unregister } from './registerServiceWorker'
import reducers from './redux/reducers'
import { reset } from 'redux/editor'
import history from 'globalHistory'

import 'carbon-components/css/carbon-components.min.css'
import './index.css'
import './bx-overrides.css'

GoogleAnalytics.initialize('UA-130502274-1')

// Setup theme.
const darkMode = localStorage.getItem('darkMode') === 'true'
document.body.className = darkMode ? 'dark' : 'light'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)))

// Clear store on history change.
history.listen(() => store.dispatch(reset()))

ReactDOM.render(
  <Provider store={store}>
    <Routing />
  </Provider>,
  document.getElementById('root')
)
unregister()
