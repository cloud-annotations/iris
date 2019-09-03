import COS from 'api/COSv2'
import { endpoints } from 'endpoints'
import history from 'globalHistory'

const lookupLocation = async bucket => {
  const promises = Object.keys(endpoints).map(region =>
    new COS({ endpoint: endpoints[region] })
      .getBucketLocation({ Bucket: bucket })
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
