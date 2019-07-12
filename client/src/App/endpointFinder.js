import OldCOS from 'api/COS'
import COS from 'api/COSv2'
import { endpoints } from 'endpoints'
import history from 'globalHistory'

const lookupEndpoint = async bucket => {
  const promises = Object.keys(endpoints).map(region =>
    new OldCOS(endpoints[region])
      .bucket(bucket)
      .location()
      .then(() => region)
      .catch(() => false)
  )
  return Promise.all(promises).then(res => {
    for (const i in res) {
      const region = res[i]
      if (region) {
        return endpoints[region]
      }
    }
  })
}

const endpointFinder = async bucket => {
  const doSearch = window.confirm(
    `Unable to find the bucket "${bucket}" in this region. Would you like to search other regions?`
  )
  if (doSearch) {
    const realEndpoint = await lookupEndpoint(bucket)
    if (!realEndpoint) {
      alert("Couldn't find bucket.")
      history.push('/')
      return
    }
    const switchEndpoint = window.confirm(
      `Bucket "${bucket}" found in region "${realEndpoint}". Would you like to switch to this region?`
    )
    if (switchEndpoint) {
      localStorage.setItem('loginUrl', realEndpoint)
      // This is a hacky way to handle this, but the page won't reload
      // unless we switch to another page first.
      history.push('/')
      history.push(bucket)
      return
    }
  }
  history.push('/')
}

const lookupLocation = async bucket => {
  const promises = Object.keys(endpoints).map(region =>
    new OldCOS(endpoints[region])
      .bucket(bucket)
      .location()
      .then(() => region)
      .catch(() => false)
  )
  return Promise.all(promises).then(res => {
    for (const i in res) {
      const region = res[i]
      return region
    }
  })
}

export const locationFinder = async bucket => {
  const doSearch = window.confirm(
    `Unable to find the bucket "${bucket}" in this region. Would you like to search other regions?`
  )
  if (doSearch) {
    try {
      const location = await lookupLocation(bucket)
      history.push(`?location=${location}`)
      return
    } catch (e) {
      console.error(e)
      alert("Couldn't find bucket.")
      history.push('/')
      return
    }
  }
  history.push('/')
}

export default endpointFinder
