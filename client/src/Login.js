import React, { Component } from 'react'
import './Login.css'

class Login extends Component {
  constructor(props) {
    super(props)

    const resourceId = localStorage.getItem('resourceId') || ''
    const loginUrl = localStorage.getItem('loginUrl') || ''

    this.state = {
      resourceId: resourceId,
      loginUrl: loginUrl,
      apiKey: ''
    }
  }

  handleUserInput = e => {
    const name = e.target.name
    const value = e.target.value
    this.setState({ [name]: value })
  }

  isValid = () => {
    const { resourceId, loginUrl, apiKey } = this.state
    return resourceId.length > 0 && loginUrl.length > 0 && apiKey.length > 0
  }

  login = () => {
    const { resourceId, loginUrl, apiKey } = this.state
    localStorage.setItem('resourceId', resourceId)
    localStorage.setItem('loginUrl', loginUrl)

    const url = 'api/auth?apikey=' + apiKey
    const options = {
      method: 'GET'
    }
    const request = new Request(url)
    fetch(request, options)
      .then(response => {
        if (!response.ok) {
          // Fake a forbidden.
          throw Error('Forbidden')
        }
        return response
      })
      .then(() => {
        this.props.history.push('/')
      })
      .catch(error => {
        console.error(error)
      })
  }

  render() {
    return (
      <div>
        <div className="Login-TopBar">
          <div className="Login-TopBar-title">
            Cloud Object Storage / Connection Details
          </div>
        </div>
        <div className="Login-Parent">
          <div className="Login-FormWrapper">
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">
                Resource Instance ID
              </label>
              <input
                value={this.state.resourceId}
                className="Login-FormItem-Input"
                type="text"
                name="resourceId"
                onChange={this.handleUserInput}
              />
            </div>
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">Login URL</label>
              <input
                value={this.state.loginUrl}
                className="Login-FormItem-Input"
                type="text"
                name="loginUrl"
                onChange={this.handleUserInput}
              />
            </div>
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">API Key</label>
              <input
                className="Login-FormItem-Input"
                type="password"
                name="apiKey"
                onChange={this.handleUserInput}
              />
            </div>
          </div>
        </div>
        <div className="Login-BottomBar">
          <div
            className={`Login-Button ${this.isValid() ? '' : '--Dissabled'}`}
            onClick={this.login}
          >
            Continue
          </div>
        </div>
      </div>
    )
  }
}

export default Login
