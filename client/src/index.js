import React from 'react'
import ReactDOM from 'react-dom'
import GoogleAnalytics from 'react-ga'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import Routing from './Routing'
import { unregister } from './registerServiceWorker'
import reducers from './redux/reducers'

import 'carbon-components/css/carbon-components.min.css'
import './index.css'
import './bx-overrides.css'

GoogleAnalytics.initialize('UA-130502274-1')

// Setup theme.
const darkMode = localStorage.getItem('darkMode') === 'true'
document.body.className = darkMode ? 'dark' : 'light'

const store = createStore(reducers)

ReactDOM.render(
  <Provider store={store}>
    <Routing />
  </Provider>,
  document.getElementById('root')
)
unregister()
