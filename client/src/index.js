import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Routing from './Routing'
import registerServiceWorker from './registerServiceWorker'
import ReactGA from 'react-ga'

ReactGA.initialize('UA-130502274-1')
ReactGA.pageview(window.location.pathname + window.location.search)

ReactDOM.render(<Routing />, document.getElementById('root'))
registerServiceWorker()
