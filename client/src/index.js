import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Routing from './Routing'
import { unregister } from './registerServiceWorker'
import GoogleAnalytics from 'react-ga'

GoogleAnalytics.initialize('UA-130502274-1')

ReactDOM.render(<Routing />, document.getElementById('root'))
unregister()
