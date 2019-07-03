import React, { useEffect, useState, useCallback } from 'react'
import {
  Select,
  SelectItemGroup,
  SelectItem,
  TextInput,
  Loading
} from 'carbon-components-react'
import queryString from 'query-string'

import { handleErrors, validateCookies } from './Utils'
import { endpoints, regions } from './endpoints'
import { useGoogleAnalytics } from 'googleAnalyticsHook'

import history from 'globalHistory'
import styles from './Login.module.css'

const TextInputWithLabel = ({
  placeholder,
  name,
  value,
  type,
  autoComplete,
  onInputChanged,
  errorText,
  error
}) => {
  return (
    <div className={styles.formItem}>
      <label className={styles.label}>{placeholder}</label>
      <div className={styles.inputWrapper}>
        <TextInput
          className={error ? styles.errorInput : styles.input}
          placeholder={placeholder}
          autoComplete={autoComplete}
          name={name}
          value={value}
          type={type}
          onChange={onInputChanged}
          invalidText={errorText}
          invalid={error}
        />
        {error && (
          <svg
            className={styles.errorIcon}
            focusable="false"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path d="M8 1C4.2 1 1 4.2 1 8s3.2 7 7 7 7-3.1 7-7-3.1-7-7-7zm-.5 3h1v5h-1V4zm.5 8.2c-.4 0-.8-.4-.8-.8s.3-.8.8-.8c.4 0 .8.4.8.8s-.4.8-.8.8z" />
            <path
              d="M7.5 4h1v5h-1V4zm.5 8.2c-.4 0-.8-.4-.8-.8s.3-.8.8-.8c.4 0 .8.4.8.8s-.4.8-.8.8z"
              data-icon-path="inner-path"
              opacity="0"
            />
          </svg>
        )}
      </div>
    </div>
  )
}

const HMAC = () => {
  const hmacMode = 'hmac' in queryString.parse(history.location.search)
  console.log(hmacMode)

  const storedResourceId = localStorage.getItem('resourceId') || ''
  const storedEndpoint = localStorage.getItem('loginUrl') || ''

  // Determine default endpoint.
  let defaultEndpoint = endpoints[regions['cross-region'][0]]
  if (Object.keys(endpoints).find(key => endpoints[key] === storedEndpoint)) {
    defaultEndpoint = storedEndpoint
  }

  const [resourceId, setResourceId] = useState(storedResourceId)
  const [endpoint, setEndpoint] = useState(defaultEndpoint)
  const [isCustomEndpoint, setIsCustomEndpoint] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [resourceError, setResourceError] = useState(false)
  const [apiKeyError, setApiKeyError] = useState(false)

  const handleUserInput = useCallback(e => {
    const { name, value } = e.target

    switch (name) {
      case 'apiKey':
        setApiKey(value)
        setApiKeyError(null)
        return
      case 'resourceId':
        setResourceId(value)
        setResourceError(null)
        return
      default:
        return
    }
  }, [])

  const handleSwitchToEndpoint = useCallback(() => {
    setIsCustomEndpoint(e => !e)
  }, [])

  const handleEndpointSelect = useCallback(e => {
    setEndpoint(endpoints[e.target.options[e.target.selectedIndex].value])
  }, [])

  const defaultRegion = Object.keys(endpoints).find(
    key => endpoints[key] === endpoint
  )

  return (
    <>
      <TextInputWithLabel
        placeholder="Access Key ID"
        name="accessKeyId"
        type="text"
        autoComplete="off"
        onInputChanged={handleUserInput}
        errorText="Invalid access key id."
        error={resourceError}
      />
      <div className={styles.formItem}>
        <label className={styles.label}>
          {isCustomEndpoint ? 'Endpoint' : 'Region'}
          <span className={styles.fakeLink} onClick={handleSwitchToEndpoint}>
            {isCustomEndpoint
              ? 'switch to region'
              : 'switch to custom endpoint'}
          </span>
        </label>
        <>
          {isCustomEndpoint ? (
            <TextInput
              className={styles.input}
              placeholder="Endpoint"
              autoComplete="off"
              name="endpoint"
              type="text"
              onChange={handleUserInput}
            />
          ) : (
            <Select
              className={styles.select}
              hideLabel
              onChange={handleEndpointSelect}
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
          )}
        </>
      </div>
      <TextInputWithLabel
        placeholder="Secret Access Key"
        name="secretAccessKey"
        type="password"
        autoComplete="new-password"
        onInputChanged={handleUserInput}
        errorText="Invalid secret access key."
        error={apiKeyError}
      />
      <a href="/login">Log in with IAM credentials</a>
    </>
  )
}

const IAM = () => {
  const storedResourceId = localStorage.getItem('resourceId') || ''
  const storedEndpoint = localStorage.getItem('loginUrl') || ''

  // Determine default endpoint.
  let defaultEndpoint = endpoints[regions['cross-region'][0]]
  if (Object.keys(endpoints).find(key => endpoints[key] === storedEndpoint)) {
    defaultEndpoint = storedEndpoint
  }

  const [resourceId, setResourceId] = useState(storedResourceId)
  const [endpoint, setEndpoint] = useState(defaultEndpoint)
  const [apiKey, setApiKey] = useState('')
  const [resourceError, setResourceError] = useState(false)
  const [apiKeyError, setApiKeyError] = useState(false)

  const handleUserInput = useCallback(e => {
    const { name, value } = e.target

    switch (name) {
      case 'apiKey':
        setApiKey(value)
        setApiKeyError(null)
        return
      case 'resourceId':
        setResourceId(value)
        setResourceError(null)
        return
      default:
        return
    }
  }, [])

  const handleEndpointSelect = useCallback(e => {
    setEndpoint(endpoints[e.target.options[e.target.selectedIndex].value])
  }, [])

  const defaultRegion = Object.keys(endpoints).find(
    key => endpoints[key] === endpoint
  )

  return (
    <>
      <TextInputWithLabel
        placeholder="Resource Instance ID"
        name="resourceId"
        value={resourceId}
        type="text"
        autoComplete="off"
        onInputChanged={handleUserInput}
        errorText="Invalid resource instance id."
        error={resourceError}
      />
      <div className={styles.formItem}>
        <label className={styles.label}>Region</label>
        <Select
          className={styles.select}
          hideLabel
          onChange={handleEndpointSelect}
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
      <TextInputWithLabel
        placeholder="API Key"
        name="apiKey"
        type="password"
        autoComplete="new-password"
        onInputChanged={handleUserInput}
        errorText="Invalid api key."
        error={apiKeyError}
      />
      <a href="/login?hmac">Log in with HMAC credentials</a>
    </>
  )
}

const getResourceId = () => localStorage.getItem('resourceId') || ''
const getApiKey = () => '' // apiKey doesn't get stored, we store a token in cookies.
const getAccessKeyId = () => localStorage.getItem('accessKeyId') || ''
const getSecretAccessKey = () => localStorage.getItem('secretAccessKey') || ''
const getEndpoint = ({ custom }) => {
  const stored = localStorage.getItem('endpoint') || ''
  // If it's not custom, ensure that the endpoint is one in our list.
  if (custom || Object.keys(endpoints).find(k => endpoints[k] === stored)) {
    return stored
  }
  return endpoints[regions['cross-region'][0]]
}

const useCheckIfLoggedIn = () => {
  useEffect(() => {
    try {
      validateCookies()
      history.push('/')
    } catch (error) {
      console.log(error)
    }
  }, [])
}

const Login = () => {
  const hmacMode = 'hmac' in queryString.parse(history.location.search)

  const [loading, setLoading] = useState(false)

  // // Form values.
  // const [resourceId, setResourceId] = useState(getResourceId())
  // const [apiKey, setApiKey] = useState(getApiKey())
  // const [accessKeyId, setAccessKeyId] = useState(getAccessKeyId())
  // const [secretAccessKey, setSecretAccessKey] = useState(getSecretAccessKey())
  // const [endpoint, setEndpoint] = useState(getEndpoint({ custom: false }))
  // // Errors.
  // const [resourceError, setResourceError] = useState(false)
  // const [apiKeyError, setApiKeyError] = useState(false)

  const [formData, setFormData] = useState({
    resourceId: {
      value: getResourceId(),
      error: null
    },
    apiKey: {
      value: getApiKey(),
      error: null
    },
    accessKeyId: {
      value: getAccessKeyId(),
      error: null
    },
    secretAccessKey: {
      value: getSecretAccessKey(),
      error: null
    },
    endpoint: {
      value: getEndpoint({ custom: false }),
      error: null
    }
  })

  useGoogleAnalytics('login')
  useCheckIfLoggedIn()

  const handleUserInput = useCallback(e => {
    const { name, value } = e.target
    setFormData(oldData => {
      const newData = { ...oldData }
      newData[name].value = value
      newData[name].error = null
      return newData
    })
  }, [])

  const handleLogin = useCallback(async () => {
    localStorage.setItem('resourceId', resourceId)
    localStorage.setItem('loginUrl', endpoint)

    setLoading(true)

    // Try to log in.
    const authUrl = '/api/auth?apikey=' + apiKey
    try {
      await fetch(authUrl, { method: 'GET' }).then(handleErrors)
    } catch (e) {
      console.error(e)
      setApiKeyError(e)
      setLoading(false)
      return
    }

    // If we could log in try to load buckets. This will tell us if our
    // resourceId is correct.
    const cosUrl = `/api/proxy/${endpoint}`
    const options = {
      method: 'GET',
      headers: { 'ibm-service-instance-id': resourceId }
    }

    try {
      await fetch(cosUrl, options).then(handleErrors)
    } catch (e) {
      console.error(e)
      // resource instance id isn't right so clear cookies
      document.cookie = 'token=; Max-Age=-99999999; path=/'
      document.cookie = 'refresh_token=; Max-Age=-99999999; path=/'
      setResourceError(e)
      setLoading(false)
      return
    }

    // Stop loading and go to the main app.
    setLoading(false)
    history.push('/')
  }, [apiKey, endpoint, resourceId])

  const isValid =
    resourceId.length > 0 && endpoint.length > 0 && apiKey.length > 0

  return (
    <div>
      <Loading active={loading} />
      <div className={styles.topBar}>
        <div className={styles.title}>
          Cloud Object Storage — {hmacMode ? 'HMAC' : 'IAM'}
        </div>
      </div>
      <div className={styles.content}>
        <form className={styles.form} autoComplete="off">
          {hmacMode ? <HMAC /> : <IAM />}
        </form>
      </div>
      <div className={styles.bottomBar}>
        <div
          className={isValid ? styles.button : styles.buttonDissabled}
          onClick={handleLogin}
        >
          Continue
        </div>
      </div>
    </div>
  )
}

export default Login
