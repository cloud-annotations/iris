import React from 'react'
import ReactDOM from 'react-dom'
import GoogleAnalytics from 'react-ga'

import Routing from './Routing'
import { unregister } from './registerServiceWorker'

import './index.css'
import 'carbon-components/css/carbon-components.min.css'
import './bx-overrides.css'

GoogleAnalytics.initialize('UA-130502274-1')

ReactDOM.render(<Routing />, document.getElementById('root'))
unregister()
