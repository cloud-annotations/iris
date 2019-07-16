import MD5 from 'crypto-js/md5'
import Base64 from 'crypto-js/enc-base64'

import { checkLoginStatus, handleErrors } from 'Utils'

export default class COS {
  constructor(endpoint) {
    this.endpoint = endpoint
  }

  deleteBucket = async bucketName => {
    const baseUrl = `/api/proxy/${this.endpoint}/${bucketName}`
    // Build delete files xml.
    const deleteXml = await fetch(baseUrl, { method: 'GET' })
      .then(handleErrors)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
      .then(data => {
        const elements = data.getElementsByTagName('Contents')
        const fileList = Array.prototype.map.call(elements, element => {
          return element.getElementsByTagName('Key')[0].innerHTML
        })
        if (fileList.length === 0) {
          return ''
        }
        const deleteXml = `<?xml version="1.0" encoding="UTF-8"?><Delete>${fileList
          .map(key => `<Object><Key>${key}</Key></Object>`)
          .join('')}</Delete>`
        return deleteXml
      })

    if (deleteXml.length !== 0) {
      // Delete all the files.
      const md5Hash = MD5(deleteXml).toString(Base64)
      const deleteFilesOptions = {
        method: 'POST',
        body: deleteXml,
        headers: {
          'Content-MD5': md5Hash
        }
      }
      await fetch(`${baseUrl}?delete=`, deleteFilesOptions).then(handleErrors)
    }

    // Delete the bucket.
    await fetch(baseUrl, { method: 'DELETE' }).then(handleErrors)
  }

  createBucket = async (instanceId, bucketName) => {
    const url = `/api/proxy/${this.endpoint}/${bucketName}`
    const options = {
      method: 'PUT',
      headers: {
        'ibm-service-instance-id': instanceId
      }
    }

    return fetch(url, options).then(handleErrors)
  }

  buckets = async instanceId => {
    const url = `/api/proxy/${this.endpoint}`
    const options = {
      method: 'GET',
      headers: {
        'ibm-service-instance-id': instanceId
      }
    }

    const bucketXML = await fetch(url, options)
      .then(handleErrors)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))

    const elements = bucketXML.getElementsByTagName('Bucket')
    const bucketList = Array.prototype.map.call(elements, element => {
      const name = element.getElementsByTagName('Name')[0].innerHTML
      const date = element.getElementsByTagName('CreationDate')[0].innerHTML
      return {
        id: name,
        name: name,
        created: new Date(date).toLocaleDateString()
      }
    })

    return bucketList
  }

  bucket = bucket => {
    const TYPE = '_type'
    const LABELS_CSV = '_labels.csv'
    const ANNOTATIONS_CSV = '_annotations.csv'
    const ANNOTATIONS_JSON = '_annotations.json'

    const baseUrl = `/api/proxy/${this.endpoint}/${bucket}`

    const type = () =>
      fetch(`${baseUrl}/${TYPE}`)
        .then(handleErrors)
        .then(response => response.text())

    const location = () =>
      fetch(`${baseUrl}?location`)
        .then(handleErrors)
        .then(response => response.text())

    const fileList = (continuationToken, list = []) =>
      fetch(
        `${baseUrl}?list-type=2${
          continuationToken ? `&continuation-token=${continuationToken}` : ''
        }`
      )
        .then(handleErrors)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
        .then(data => {
          const nextContinuationToken = Array.prototype.map.call(
            data.getElementsByTagName('NextContinuationToken'),
            element => element.innerHTML
          )[0]
          const currentList = [
            ...list,
            ...Array.prototype.map.call(
              data.getElementsByTagName('Contents'),
              element => element.getElementsByTagName('Key')[0].innerHTML
            )
          ]
          if (nextContinuationToken) {
            return fileList(nextContinuationToken, currentList)
          } else {
            return currentList
          }
        })

    const labels = () =>
      fetch(`${baseUrl}/${LABELS_CSV}`)
        .then(handleErrors)
        .then(response => response.text())

    const annotations = () =>
      fetch(`${baseUrl}/${ANNOTATIONS_CSV}`)
        .then(handleErrors)
        .then(response => response.text())

    const rawCollection = () =>
      fetch(`${baseUrl}/${ANNOTATIONS_JSON}`)
        .then(handleErrors)
        .then(response => response.json())

    const collection = () =>
      fetch(`${baseUrl}/${ANNOTATIONS_JSON}`)
        .then(response => response.json())
        .then(json => {
          const imagesTemplate = { all: [], unlabeled: [], labeled: [] }
          json.labels.forEach(label => {
            imagesTemplate[label] = []
          })
          const images = Object.keys(json.annotations).reduce((acc, image) => {
            const annotation = [...json.annotations[image]]
            acc.labeled = [...new Set([...acc.labeled, image])]
            annotation.forEach(annotation => {
              acc[annotation.label] = [
                ...new Set([...acc[annotation.label], image])
              ]
            })
            return acc
          }, imagesTemplate)
          return {
            type: json.type,
            labels: json.labels,
            images: images,
            annotations: json.annotations
          }
        })

    const putImages = files => () => {
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

    const putFile = file => () => {
      const url = `${baseUrl}/${file.name}`
      const options = {
        method: 'PUT',
        body: file.blob
      }
      return fetch(url, options).then(handleErrors)
    }

    const deleteFiles = files => () => {
      const requests = files.map(file => deleteFile(file))
      return Promise.all(requests)
    }

    const deleteFile = fileName => {
      const url = `${baseUrl}/${fileName}`
      const options = {
        method: 'DELETE'
      }
      return fetch(url, options).then(handleErrors)
    }

    const preFlightCheck = func => {
      checkLoginStatus()
      return func()
    }

    return {
      type: () => preFlightCheck(type),
      location: () => preFlightCheck(location),
      fileList: () => preFlightCheck(fileList),
      labels: () => preFlightCheck(labels),
      annotations: () => preFlightCheck(annotations),
      collection: () => preFlightCheck(collection),
      rawCollection: () => preFlightCheck(rawCollection),
      putImages: files => preFlightCheck(putImages(files)),
      putFile: file => preFlightCheck(putFile(file)),
      deleteFiles: files => preFlightCheck(deleteFiles(files))
    }
  }
}
