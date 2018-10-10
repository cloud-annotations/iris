import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import TitleBar from './TitleBar'
import App from './App'
import Login from './Login'
import Buckets from './Buckets'

class Routing extends Component {
  render() {
    return (
      <div>
        <Router>
          <div>
            <Route path="/" component={TitleBar} />
            <Switch>
              {/* With `Switch` there will only ever be one child here */}
              <Route exact path="/" component={Buckets} />
              <Route path="/login" component={Login} />
              <Route path="/:bucket" component={App} />
            </Switch>
          </div>
        </Router>
      </div>
    )
  }
}

export default Routing
