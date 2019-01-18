import React, { Component } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import TitleBar from './TitleBar'
import App from './App'
import Login from './Login'
import Buckets from './Buckets'
import history from './history'

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
        <Router history={history}>
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
