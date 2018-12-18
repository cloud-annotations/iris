import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import TitleBar from './TitleBar'
import App from './App'
import Login from './Login'
import Buckets from './Buckets'

class Routing extends Component {
  state = {
    buckets: null
  }

  cacheBucketList = buckets => {
    this.setState({
      buckets: buckets
    })
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Route path="/" component={TitleBar} />
            <Switch>
              {/* With `Switch` there will only ever be one child here */}
              <Route
                exact
                path="/"
                render={props => (
                  <Buckets
                    {...props}
                    buckets={this.state.buckets}
                    cacheBucketList={this.cacheBucketList}
                  />
                )}
              />
              <Route
                path="/login"
                render={props => (
                  <Login {...props} cacheBucketList={this.cacheBucketList} />
                )}
              />
              <Route path="/:bucket" component={App} />
            </Switch>
          </div>
        </Router>
      </div>
    )
  }
}

export default Routing
