import React from 'react'
import ReactDOM from 'react-dom'
import GoogleAnalytics from 'react-ga'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'

import Routing from './Routing'
import { unregister } from './registerServiceWorker'
import reducers from './redux/reducers'
import { reset, updateHeadCount } from 'redux/editor'
import history from 'globalHistory'
import socket from 'globalSocket'

import 'carbon-components/css/carbon-components.min.css'
import './index.css'
import './bx-overrides.css'
import {
  createBox,
  deleteBox,
  deleteLabel,
  createLabel,
  deleteImages,
  uploadImages
} from 'redux/collection'

GoogleAnalytics.initialize('UA-130502274-1')

// Setup theme.
const darkMode = localStorage.getItem('darkMode') === 'true'
document.body.className = darkMode ? 'dark' : 'light'

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // trace: true,
    // traceLimit: 25
  }) || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)))

// Clear store on history change.
history.listen(() => store.dispatch(reset()))
socket.on('patch', res => {
  const { op, value } = res
  const { annotations, images, labels } = value

  if (labels) {
    if (op === '+') {
      store.dispatch(createLabel(labels.label, false))
      return
    }
    if (op === '-') {
      store.dispatch(deleteLabel(labels.label, false))
      return
    }
  }

  if (images) {
    if (op === '+') {
      store.dispatch(uploadImages(images.images, false))
      return
    }
    if (op === '-') {
      store.dispatch(deleteImages(images.images, false))
      return
    }
  }

  if (annotations) {
    if (op === '+') {
      store.dispatch(createBox(annotations.image, annotations.box, false))
      return
    }
    if (op === '-') {
      store.dispatch(deleteBox(annotations.image, annotations.box, false))
      return
    }
  }
})

socket.on('theHeadCount', count => {
  store.dispatch(updateHeadCount(count))
})

ReactDOM.render(
  <Provider store={store}>
    <Routing />
  </Provider>,
  document.getElementById('root')
)
unregister()
