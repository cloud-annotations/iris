import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import App from './App'

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

class Routing extends Component {
  render() {
    return (
      <Router>
        <Switch>
          {/* With `Switch` there will only ever be one child here */}
          <Route exact path="/" component={Home} />
          <Route path="/:bucket" component={App} />
        </Switch>
      </Router>
    )
  }
}

export default Routing
