import localforage from 'localforage'
import { handleErrors, arrayBufferToBase64 } from 'Utils'

export default (endpoint, bucket, imageUrl) => {
  const baseUrl = `/api/proxy/${endpoint}/${bucket}/${imageUrl}`
  return localforage.getItem(imageUrl).then(data => {
    if (data === null || data === '') {
      return fetch(baseUrl)
        .then(handleErrors)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const base64Flag = 'data:image/jpeg;base64,'
          const base64Image = base64Flag + arrayBufferToBase64(buffer)
          localforage.setItem(imageUrl, base64Image)
          return { image: base64Image }
        })
    } else {
      return { image: data }
    }
  })
}
