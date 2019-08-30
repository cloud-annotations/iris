import { generateUUID, handleErrors } from './../Utils'

export default (endpoint, bucket, files) => {
  const baseUrl = `/api/proxy/${endpoint}/${bucket}`

  const requests = files.map(file => {
    const url = `${baseUrl}/${file.name}`
    const options = {
      method: 'PUT',
      body: file.blob
    }
    return fetch(url, options).then(handleErrors)
  })

  // The COS api returns nothing, so we will return a list of names.
  return Promise.all(requests).then(() => files.map(file => file.name))
}
