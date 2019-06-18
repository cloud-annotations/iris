import COS from 'api/COS'
import { endpoints } from 'endpoints'
import history from 'globalHistory'

const lookupEndpoint = async bucket => {
  const promises = Object.keys(endpoints).map(region =>
    new COS(endpoints[region])
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

export default endpointFinder
