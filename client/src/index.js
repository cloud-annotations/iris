import React from 'react'
import ReactDOM from 'react-dom'
import GoogleAnalytics from 'react-ga'

import Routing from './Routing'
import { unregister } from './registerServiceWorker'

import 'carbon-components/css/carbon-components.min.css'
import './index.css'
import './bx-overrides.css'

GoogleAnalytics.initialize('UA-130502274-1')

// Setup theme.
const darkMode = localStorage.getItem('darkMode') === 'true'
document.body.className = darkMode ? 'dark' : 'light'

ReactDOM.render(<Routing />, document.getElementById('root'))
unregister()
