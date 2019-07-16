import { handleErrors, parseXML } from 'Utils'
import { getSignatureHeaders } from './hmacSignatureUtils'

export const iamLogin = async (resourceId, endpoint, apiKey) => {
  localStorage.setItem('resourceId', resourceId)
  localStorage.setItem('endpoint', endpoint)
  // Generate a cookie token, we only need to do this for IAM.
  const authUrl = `/api/auth?apikey=${apiKey}`
  try {
    await fetch(authUrl, { method: 'GET' }).then(handleErrors)
  } catch (e) {
    console.error(e)
    const error = new Error()
    error.message = e.message
    error.stack = e.stack
    error.name = 'ApiKeyError'
    throw error
  }

  // If we could log in, try to load buckets. This will tell us if our
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
    const error = new Error()
    error.message = e.message
    error.stack = e.stack
    error.name = 'ResourceIdError'
    throw error
  }
}

export const hmacLogin = async (accessKeyId, endpoint, secretAccessKey) => {
  localStorage.setItem('accessKeyId', accessKeyId)
  localStorage.setItem('endpoint', endpoint)
  localStorage.setItem('secretAccessKey', secretAccessKey)

  console.log(accessKeyId)
  console.log(endpoint)
  console.log(secretAccessKey)

  const { protocol, host } = window.location

  const config = {
    endpoint: endpoint,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }

  // We don't have sessions so we can just try to load the bucket list.
  try {
    const headers = getSignatureHeaders(config)
    const res = await fetch(`${protocol}//${host}/api/proxy/${endpoint}`, {
      headers: headers
    })
    if (!res.ok) {
      const text = await res.text()
      const json = parseXML(text)

      const error = new Error()
      error.message = json.Error.Message
      error.name = json.Error.Code
      console.error(json)
      throw error
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
