import { validateCookies, handleErrors } from 'Utils'

export default class COS {
  constructor(endpoint) {
    this.endpoint = endpoint
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

    const putImages = files => {
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

    const putFile = file => {
      const url = `${baseUrl}/${file.name}`
      const options = {
        method: 'PUT',
        body: file.blob
      }
      return fetch(url, options).then(handleErrors)
    }

    const deleteFiles = files => {
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

    return {
      type: () => validateCookies().then(type),
      location: () => validateCookies().then(location),
      fileList: () => validateCookies().then(fileList),
      labels: () => validateCookies().then(labels),
      annotations: () => validateCookies().then(annotations),
      collection: () => validateCookies().then(collection),
      putImages: files => validateCookies().then(() => putImages(files)),
      putFile: file => validateCookies().then(() => putFile(file)),
      deleteFiles: files => validateCookies().then(() => deleteFiles(files))
    }
  }
}
