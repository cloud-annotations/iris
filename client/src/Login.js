import React, { Component } from 'react'
import {
  Select,
  SelectItemGroup,
  SelectItem,
  TextInput,
  Loading
} from 'carbon-components-react'
import GoogleAnalytics from 'react-ga'
import { handleErrors, validateCookies } from './Utils'

import 'carbon-components/css/carbon-components.min.css'

import history from './history'
import './Login.css'

const regions = {
  'cross-region': [
    'us',
    'dal.us',
    'wdc.us',
    'sjc.us',
    'eu',
    'ams.eu',
    'fra.eu',
    'mil.eu',
    'ap',
    'tok.ap',
    'seo.ap',
    'hkg.ap'
  ],
  regional: ['us-south', 'us-east', 'eu-gb', 'eu-de', 'jp-tok', 'au-syd'],
  'single-site': [
    'ams03',
    'che01',
    'mel01',
    'osl01',
    'tor01',
    'sao01',
    'seo01',
    'mon01',
    'mex01',
    'sjc04',
    'mil01',
    'hkg02'
  ]
}

let endpoints = {
  us: 's3.private.us.cloud-object-storage.appdomain.cloud',
  'dal.us': 's3.private.dal.us.cloud-object-storage.appdomain.cloud',
  'wdc.us': 's3.private.wdc.us.cloud-object-storage.appdomain.cloud',
  'sjc.us': 's3.private.sjc.us.cloud-object-storage.appdomain.cloud',
  eu: 's3.private.eu.cloud-object-storage.appdomain.cloud',
  'ams.eu': 's3.private.ams.eu.cloud-object-storage.appdomain.cloud',
  'fra.eu': 's3.private.fra.eu.cloud-object-storage.appdomain.cloud',
  'mil.eu': 's3.private.mil.eu.cloud-object-storage.appdomain.cloud',
  ap: 's3.private.ap.cloud-object-storage.appdomain.cloud',
  'tok.ap': 's3.private.tok.ap.cloud-object-storage.appdomain.cloud',
  'seo.ap': 's3.private.seo.ap.cloud-object-storage.appdomain.cloud',
  'hkg.ap': 's3.private.hkg.ap.cloud-object-storage.appdomain.cloud',
  'us-south': 's3.private.us-south.cloud-object-storage.appdomain.cloud',
  'us-east': 's3.private.us-east.cloud-object-storage.appdomain.cloud',
  'eu-gb': 's3.private.eu-gb.cloud-object-storage.appdomain.cloud',
  'eu-de': 's3.private.eu-de.cloud-object-storage.appdomain.cloud',
  'jp-tok': 's3.private.jp-tok.cloud-object-storage.appdomain.cloud',
  'au-syd': 's3.private.au-syd.cloud-object-storage.appdomain.cloud',
  ams03: 's3.private.ams03.cloud-object-storage.appdomain.cloud',
  che01: 's3.private.che01.cloud-object-storage.appdomain.cloud',
  mel01: 's3.private.mel01.cloud-object-storage.appdomain.cloud',
  osl01: 's3.private.osl01.cloud-object-storage.appdomain.cloud',
  tor01: 's3.private.tor01.cloud-object-storage.appdomain.cloud',
  sao01: 's3.private.sao01.cloud-object-storage.appdomain.cloud',
  seo01: 's3.private.seo01.cloud-object-storage.appdomain.cloud',
  mon01: 's3.private.mon01.cloud-object-storage.appdomain.cloud',
  mex01: 's3.private.mex01.cloud-object-storage.appdomain.cloud',
  sjc04: 's3.private.sjc04.cloud-object-storage.appdomain.cloud',
  mil01: 's3.private.mil01.cloud-object-storage.appdomain.cloud',
  hkg02: 's3.private.hkg02.cloud-object-storage.appdomain.cloud'
}

if (process.env.NODE_ENV === 'development') {
  endpoints = {
    us: 's3.us.cloud-object-storage.appdomain.cloud',
    'dal.us': 's3.dal.us.cloud-object-storage.appdomain.cloud',
    'wdc.us': 's3.wdc.us.cloud-object-storage.appdomain.cloud',
    'sjc.us': 's3.sjc.us.cloud-object-storage.appdomain.cloud',
    eu: 's3.eu.cloud-object-storage.appdomain.cloud',
    'ams.eu': 's3.ams.eu.cloud-object-storage.appdomain.cloud',
    'fra.eu': 's3.fra.eu.cloud-object-storage.appdomain.cloud',
    'mil.eu': 's3.mil.eu.cloud-object-storage.appdomain.cloud',
    ap: 's3.ap.cloud-object-storage.appdomain.cloud',
    'tok.ap': 's3.tok.ap.cloud-object-storage.appdomain.cloud',
    'seo.ap': 's3.seo.ap.cloud-object-storage.appdomain.cloud',
    'hkg.ap': 's3.hkg.ap.cloud-object-storage.appdomain.cloud',
    'us-south': 's3.us-south.cloud-object-storage.appdomain.cloud',
    'us-east': 's3.us-east.cloud-object-storage.appdomain.cloud',
    'eu-gb': 's3.eu-gb.cloud-object-storage.appdomain.cloud',
    'eu-de': 's3.eu-de.cloud-object-storage.appdomain.cloud',
    'jp-tok': 's3.jp-tok.cloud-object-storage.appdomain.cloud',
    'au-syd': 's3.au-syd.cloud-object-storage.appdomain.cloud',
    ams03: 's3.ams03.cloud-object-storage.appdomain.cloud',
    che01: 's3.che01.cloud-object-storage.appdomain.cloud',
    mel01: 's3.mel01.cloud-object-storage.appdomain.cloud',
    osl01: 's3.osl01.cloud-object-storage.appdomain.cloud',
    tor01: 's3.tor01.cloud-object-storage.appdomain.cloud',
    sao01: 's3.sao01.cloud-object-storage.appdomain.cloud',
    seo01: 's3.seo01.cloud-object-storage.appdomain.cloud',
    mon01: 's3.mon01.cloud-object-storage.appdomain.cloud',
    mex01: 's3.mex01.cloud-object-storage.appdomain.cloud',
    sjc04: 's3.sjc04.cloud-object-storage.appdomain.cloud',
    mil01: 's3.mil01.cloud-object-storage.appdomain.cloud',
    hkg02: 's3.hkg02.cloud-object-storage.appdomain.cloud'
  }
}

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
      validateCookies()
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
