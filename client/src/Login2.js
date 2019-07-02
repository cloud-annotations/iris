import React, { useEffect, useState, useCallback } from 'react'
import {
  Select,
  SelectItemGroup,
  SelectItem,
  TextInput,
  Loading
} from 'carbon-components-react'
import GoogleAnalytics from 'react-ga'
import { handleErrors, validateCookies } from './Utils'
import { endpoints, regions } from './endpoints'

import history from 'globalHistory'
import styles from './Login.module.css'

const Login = () => {
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
  const [loading, setLoading] = useState(false)
  const [resourceError, setResourceError] = useState(false)
  const [apiKeyError, setApiKeyError] = useState(false)

  useEffect(() => {
    GoogleAnalytics.pageview('login')
    // Check if we are already logged in.
    try {
      validateCookies()
      history.push('/')
    } catch (error) {
      // We are on the Login page so no need to redirect to /Login.
      console.log(error)
    }
  }, [])

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

  const defaultRegion = Object.keys(endpoints).find(
    key => endpoints[key] === endpoint
  )

  const isValid =
    resourceId.length > 0 && endpoint.length > 0 && apiKey.length > 0

  return (
    <div>
      <Loading active={loading} />
      <div className={styles.topBar}>
        <div className={styles.title}>
          Cloud Object Storage — Connection Details
        </div>
      </div>
      <div className={styles.content}>
        <form className={styles.form}>
          <div className={styles.formItem}>
            <label className={styles.label}>Resource Instance ID</label>
            <div className={styles.inputWrapper}>
              <TextInput
                className={resourceError ? styles.errorInput : styles.input}
                placeholder="Resource Instance ID"
                autoComplete="username"
                name="resourceId"
                value={resourceId}
                type="text"
                onChange={handleUserInput}
                invalidText="Invalid resource instance id."
                invalid={resourceError}
              />
              {resourceError && (
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
          <div className={styles.formItem}>
            <label className={styles.label}>API Key</label>
            <div className={styles.inputWrapper}>
              <TextInput
                className={apiKeyError ? styles.errorInput : styles.input}
                placeholder="API Key"
                autoComplete="current-password"
                name="apiKey"
                type="password"
                onChange={handleUserInput}
                invalidText="Invalid api key."
                invalid={apiKeyError}
              />
              {apiKeyError && (
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
