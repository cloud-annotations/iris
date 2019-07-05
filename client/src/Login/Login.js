import React, { useEffect, useState, useCallback } from 'react'
import { Loading } from 'carbon-components-react'
import queryString from 'query-string'

import { handleErrors, validateCookies } from 'Utils'
import { endpoints, regions } from 'endpoints'
import { useGoogleAnalytics } from 'googleAnalyticsHook'
import IAM from './IAM'
import HMAC from './HMAC'

import history from 'globalHistory'
import styles from './Login.module.css'

const getResourceId = () => localStorage.getItem('resourceId') || ''
const getApiKey = () => '' // apiKey doesn't get stored, we store a token in cookies.
const getAccessKeyId = () => localStorage.getItem('accessKeyId') || ''
const getSecretAccessKey = () => localStorage.getItem('secretAccessKey') || ''
const getEndpoint = () => localStorage.getItem('endpoint') || ''

const conformToFixedEndpoints = endpoint => {
  if (Object.keys(endpoints).find(k => endpoints[k] === endpoint)) {
    return endpoint
  }
  return endpoints[regions['cross-region'][0]]
}

const useChooseEndpointFromListIfNotCustom = (custom, setFormData) => {
  useEffect(() => {
    if (!custom) {
      setFormData(data => ({
        ...data,
        endpoint: conformToFixedEndpoints(data.endpoint)
      }))
    }
  }, [custom, setFormData])
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
  const [isCustomEndpoint, setIsCustomEndpoint] = useState(false)
  const [formData, setFormData] = useState({
    resourceId: getResourceId(),
    apiKey: getApiKey(),
    accessKeyId: getAccessKeyId(),
    secretAccessKey: getSecretAccessKey(),
    endpoint: getEndpoint()
  })
  const [formError, setFormError] = useState({
    resourceId: null,
    apiKey: null,
    accessKeyId: null,
    secretAccessKey: null,
    endpoint: null
  })

  useGoogleAnalytics('login')
  useCheckIfLoggedIn()
  useChooseEndpointFromListIfNotCustom(isCustomEndpoint, setFormData)

  const handleInputChanged = useCallback(e => {
    const { name, type } = e.target
    let { value } = e.target

    // If it's an endpoint select, convert region to endpoint.
    if (name === 'endpoint' && type === 'select-one') {
      value = endpoints[value]
    }

    setFormData(data => ({ ...data, [name]: value }))
    setFormError(data => ({ ...data, [name]: null }))
  }, [])

  const handleToggleCustomEndpoint = useCallback(() => {
    setIsCustomEndpoint(e => !e)
  }, [])

  const handleLogin = useCallback(async () => {
    setLoading(true)

    if (!hmacMode) {
      localStorage.setItem('resourceId', formData.resourceId)
      localStorage.setItem('endpoint', formData.endpoint)
      // Generate a cookie token, we only need to do this for IAM.
      const authUrl = '/api/auth?apikey=' + formData.apiKey
      try {
        await fetch(authUrl, { method: 'GET' }).then(handleErrors)
      } catch (e) {
        console.error(e)
        setFormError(data => ({ ...data, apiKey: e }))
        setLoading(false)
        return
      }

      // If we could log in try to load buckets. This will tell us if our
      // resourceId is correct.
      const cosUrl = `/api/proxy/${formData.endpoint}`
      const options = {
        method: 'GET',
        headers: { 'ibm-service-instance-id': formData.resourceId }
      }
      try {
        await fetch(cosUrl, options).then(handleErrors)
      } catch (e) {
        console.error(e)
        // resource instance id isn't right so clear cookies
        document.cookie = 'token=; Max-Age=-99999999; path=/'
        document.cookie = 'refresh_token=; Max-Age=-99999999; path=/'
        setFormError(data => ({ ...data, resourceId: e }))
        setLoading(false)
        return
      }
    }
    // Stop loading and go to the main app.
    setLoading(false)
    history.push('/')
  }, [formData.apiKey, formData.endpoint, formData.resourceId, hmacMode])

  const hmacValid =
    formData.accessKeyId.length > 0 &&
    formData.secretAccessKey.length > 0 &&
    formData.endpoint.length > 0
  const iamValid =
    formData.resourceId.length > 0 &&
    formData.apiKey.length > 0 &&
    formData.endpoint.length > 0
  const isValid = hmacMode ? hmacValid : iamValid

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
          {hmacMode ? (
            <HMAC
              accessKeyId={{
                value: formData.accessKeyId,
                error: formError.accessKeyId
              }}
              secretAccessKey={{
                value: formData.secretAccessKey,
                error: formError.secretAccessKey
              }}
              endpoint={{
                value: formData.endpoint,
                error: formError.endpoint
              }}
              isCustomEndpoint={isCustomEndpoint}
              onToggleCustomEndpoint={handleToggleCustomEndpoint}
              onInputChanged={handleInputChanged}
            />
          ) : (
            <IAM
              resourceId={{
                value: formData.resourceId,
                error: formError.resourceId
              }}
              apiKey={{
                value: formData.apiKey,
                error: formError.apiKey
              }}
              endpoint={{
                value: formData.endpoint,
                error: formError.endpoint
              }}
              onInputChanged={handleInputChanged}
            />
          )}
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
