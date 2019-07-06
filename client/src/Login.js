import React, { Component } from 'react'
import {
  Select,
  SelectItemGroup,
  SelectItem,
  TextInput,
  Loading
} from 'carbon-components-react'
import GoogleAnalytics from 'react-ga'
import { handleErrors, checkLoginStatus } from './Utils'
import { endpoints, regions } from './endpoints'

import 'carbon-components/css/carbon-components.min.css'

import history from 'globalHistory'
import './Login.css'

class Login extends Component {
  constructor(props) {
    super(props)

    const resourceId = localStorage.getItem('resourceId') || ''

    // Ensure loginUrl is part of the endpoint map.
    let loginUrl = endpoints[regions['cross-region'][0]]
    if (
      Object.keys(endpoints).find(
        key => endpoints[key] === localStorage.getItem('loginUrl')
      )
    ) {
      loginUrl = localStorage.getItem('loginUrl')
    }

    this.state = {
      resourceId: resourceId,
      loginUrl: loginUrl,
      apiKey: '',
      loading: false
    }
  }

  componentDidMount() {
    GoogleAnalytics.pageview('login')
    // Check if we are already logged in.
    try {
      checkLoginStatus()
      history.push('/')
    } catch (error) {
      // We are on the Login page so no need to redirect to /Login.
      console.log(error)
    }
  }

  handleUserInput = e => {
    const name = e.target.name
    const value = e.target.value

    let resourceError = this.state.resourceError
    let loginError = this.state.loginError
    if (name === 'resourceId') {
      resourceError = null
    }
    if (name === 'apiKey') {
      loginError = null
    }
    this.setState({
      [name]: value,
      loginError: loginError,
      resourceError: resourceError
    })
  }

  onEndpointSelect = e => {
    const loginUrl = endpoints[e.target.options[e.target.selectedIndex].value]
    this.setState({ loginUrl: loginUrl })
  }

  isValid = () => {
    const { resourceId, loginUrl, apiKey } = this.state
    return resourceId.length > 0 && loginUrl.length > 0 && apiKey.length > 0
  }

  login = () => {
    const { resourceId, loginUrl, apiKey } = this.state
    localStorage.setItem('resourceId', resourceId)
    localStorage.setItem('loginUrl', loginUrl)

    this.setState({ loading: true })

    const url = '/api/auth?apikey=' + apiKey
    const options = {
      method: 'GET'
    }
    const request = new Request(url)
    fetch(request, options)
      .then(handleErrors)
      .then(() => {
        const url = `/api/proxy/${localStorage.getItem('loginUrl')}`
        const options = {
          method: 'GET',
          headers: {
            'ibm-service-instance-id': localStorage.getItem('resourceId')
          }
        }
        fetch(url, options)
          .then(handleErrors)
          .then(() => {
            this.setState({ loading: false })
            history.push('/')
          })
          .catch(error => {
            this.setState({ loading: false })
            // resource instance id isn't right so clear cookies
            console.error(error)
            document.cookie = 'token=; Max-Age=-99999999; path=/'
            document.cookie = 'refresh_token=; Max-Age=-99999999; path=/'
            this.setState({ resourceError: error })
          })
      })
      .catch(error => {
        this.setState({ loading: false })
        // We are on the Login page so no need to redirect to /Login.
        console.error(error)
        this.setState({ loginError: error })
      })
  }

  render() {
    const defaultRegion = Object.keys(endpoints).find(
      key => endpoints[key] === this.state.loginUrl
    )
    return (
      <div>
        <Loading active={this.state.loading} />
        <div className="Login-TopBar">
          <div className="Login-TopBar-title">
            Cloud Object Storage — Connection Details
          </div>
        </div>
        <div className="Login-Parent">
          <form className="Login-FormWrapper">
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">
                Resource Instance ID
              </label>
              <TextInput
                className="Login-FormItem-Inputx"
                autoComplete="username"
                name="resourceId"
                value={this.state.resourceId}
                type="text"
                onChange={this.handleUserInput}
                invalidText="Invalid resource instance id."
                invalid={this.state.resourceError}
              />
            </div>
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">Region</label>

              <Select
                className="Login-FormItem-Select"
                hideLabel
                onChange={this.onEndpointSelect}
                id="select-1"
                defaultValue={defaultRegion}
              >
                {Object.keys(regions).map(group => {
                  return (
                    <SelectItemGroup label={group}>
                      {regions[group].map(url => (
                        <SelectItem value={url} text={url} />
                      ))}
                    </SelectItemGroup>
                  )
                })}
              </Select>
            </div>
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">API Key</label>
              <TextInput
                className="Login-FormItem-Inputx"
                autoComplete="current-password"
                name="apiKey"
                type="password"
                onChange={this.handleUserInput}
                invalidText="Invalid api key."
                invalid={this.state.loginError}
              />
            </div>
          </form>
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
