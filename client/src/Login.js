import React, { Component } from 'react'
import { Select, SelectItemGroup, SelectItem } from 'carbon-components-react'
import GoogleAnalytics from 'react-ga'
import { handleErrors } from './Utils'
import './Login.css'

let enpoints = {
  'cross-region': [
    's3-api.us-geo.objectstorage.service.networklayer.com',
    's3-api.dal-us-geo.objectstorage.service.networklayer.com',
    's3-api.wdc-us-geo.objectstorage.service.networklayer.com',
    's3-api.sjc-us-geo.objectstorage.service.networklayer.com',
    's3.eu-geo.objectstorage.service.networklayer.com',
    's3.ams-eu-geo.objectstorage.service.networklayer.com',
    's3.fra-eu-geo.objectstorage.service.networklayer.com',
    's3.mil-eu-geo.objectstorage.service.networklayer.com',
    's3.ap-geo.objectstorage.service.networklayer.com',
    's3.tok-ap-geo.objectstorage.service.networklayer.com',
    's3.seo-ap-geo.objectstorage.service.networklayer.com',
    's3.hkg-ap-geo.objectstorage.service.networklayer.com'
  ],
  regional: [
    's3.us-south.objectstorage.service.networklayer.com',
    's3.us-east.objectstorage.service.networklayer.com',
    's3.eu-gb.objectstorage.service.networklayer.com',
    's3.eu-de.objectstorage.service.networklayer.com',
    's3.jp-tok.objectstorage.service.networklayer.com'
  ],
  'single-site': [
    's3.ams03.objectstorage.service.networklayer.com',
    's3.che01.objectstorage.service.networklayer.com',
    's3.mel01.objectstorage.service.networklayer.com',
    's3.osl01.objectstorage.service.networklayer.com',
    's3.tor01.objectstorage.service.networklayer.com',
    's3.sao01.objectstorage.service.networklayer.com'
  ]
}

if (process.env.NODE_ENV === 'development') {
  enpoints = {
    'cross-region': [
      's3-api.us-geo.objectstorage.softlayer.net',
      's3-api.dal-us-geo.objectstorage.softlayer.net',
      's3-api.wdc-us-geo.objectstorage.softlayer.net',
      's3-api.sjc-us-geo.objectstorage.softlayer.net',
      's3.eu-geo.objectstorage.softlayer.net',
      's3.ams-eu-geo.objectstorage.softlayer.net',
      's3.fra-eu-geo.objectstorage.softlayer.net',
      's3.mil-eu-geo.objectstorage.softlayer.net',
      's3.ap-geo.objectstorage.softlayer.net',
      's3.tok-ap-geo.objectstorage.softlayer.net',
      's3.seo-ap-geo.objectstorage.softlayer.net',
      's3.hkg-ap-geo.objectstorage.softlayer.net'
    ],
    regional: [
      's3.us-south.objectstorage.softlayer.net',
      's3.us-east.objectstorage.softlayer.net',
      's3.eu-gb.objectstorage.softlayer.net',
      's3.eu-de.objectstorage.softlayer.net',
      's3.jp-tok.objectstorage.softlayer.net'
    ],
    'single-site': [
      's3.ams03.objectstorage.softlayer.net',
      's3.che01.objectstorage.softlayer.net',
      's3.mel01.objectstorage.softlayer.net',
      's3.osl01.objectstorage.softlayer.net',
      's3.tor01.objectstorage.softlayer.net',
      's3.sao01.objectstorage.softlayer.net'
    ]
  }
}

class Login extends Component {
  constructor(props) {
    super(props)

    props.cacheBucketList(null)

    const resourceId = localStorage.getItem('resourceId') || ''
    const loginUrl =
      localStorage.getItem('loginUrl') || enpoints['cross-region'][0]

    this.state = {
      resourceId: resourceId,
      loginUrl: loginUrl,
      apiKey: ''
    }
  }

  componentDidMount() {
    GoogleAnalytics.pageview('login')
  }

  handleUserInput = e => {
    const name = e.target.name
    const value = e.target.value
    this.setState({ [name]: value })
  }

  onEnpointSelect = e => {
    const loginUrl = e.target.options[e.target.selectedIndex].value
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

    const url = '/api/auth?apikey=' + apiKey
    const options = {
      method: 'GET'
    }
    const request = new Request(url)
    fetch(request, options)
      .then(handleErrors)
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
            Cloud Object Storage — Connection Details
          </div>
        </div>
        <div className="Login-Parent">
          <form className="Login-FormWrapper">
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">
                Resource Instance ID
              </label>
              <input
                autoComplete="username"
                value={this.state.resourceId}
                className="Login-FormItem-Input"
                type="text"
                name="resourceId"
                onChange={this.handleUserInput}
              />
            </div>
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">Endpoint</label>

              <Select
                className="Login-FormItem-Select"
                hideLabel
                onChange={this.onEnpointSelect}
                id="select-1"
                defaultValue={this.state.loginUrl}
              >
                {Object.keys(enpoints).map(group => {
                  return (
                    <SelectItemGroup label={group}>
                      {enpoints[group].map(url => (
                        <SelectItem value={url} text={url} />
                      ))}
                    </SelectItemGroup>
                  )
                })}
              </Select>
            </div>
            <div className="Login-FormItem">
              <label className="Login-FormItem-Label">API Key</label>
              <input
                autoComplete="current-password"
                className="Login-FormItem-Input"
                type="password"
                name="apiKey"
                onChange={this.handleUserInput}
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
