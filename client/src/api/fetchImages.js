import { validateCookies, handleErrors } from 'Utils'

// This let's us loop through the collection easily.
/**
  LabelList = [Label, Label, ...]

  Collection = {
    Label: [PointerToImage, PointerToImage, ...]
    Label: [PointerToImage, PointerToImage, ...]
    Label: [PointerToImage, PointerToImage, ...]
    Label: [PointerToImage, PointerToImage, ...]
    Label: [PointerToImage, PointerToImage, ...]
  }
*/

const UNLABELED = 'Unlabeled'
const ANNOTATIONS_FILE = '_annotations.csv'
const LABELS_FILE = '_labels.csv'
const IAMGE_REGEX = /.(jpg|jpeg|png)$/i

// TODO: Handle pages larger than 1000.

export const fetchImages = (endpoint, bucket) => {
  this.baseUrl = `/api/proxy/${endpoint}/${bucket}`
  return validateCookies()
    .then(fetchFileList)
    .then(populateLabels)
    .then(populateUnlabeled)
}

const fetchFileList = () => {
  return fetch(this.baseUrl)
    .then(handleErrors)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then(data =>
      Array.prototype.map.call(
        data.getElementsByTagName('Contents'),
        element => element.getElementsByTagName('Key')[0].innerHTML
      )
    )
}

const populateLabels = fileList => {
  if (!fileList.includes(ANNOTATIONS_FILE) || !fileList.includes(LABELS_FILE)) {
    return fileList
  }

  const labels = fetch(`${this.baseUrl}/${LABELS_FILE}`)
    .then(handleErrors)
    .then(response => response.text())

  const annotations = fetch(`${this.baseUrl}/${ANNOTATIONS_FILE}`)
    .then(handleErrors)
    .then(response => response.text())

  return Promise.all([labels, annotations]).then(values => {
    const labelsCsv = values[0]
    const annotationsCsv = values[1]

    const collection = { Unlabeled: [] }
    let labelList = [UNLABELED]

    const labels = labelsCsv.split('\n')
    labels.forEach(label => {
      label = label.trim()
      // Account for empty lines.
      if (label !== '') {
        labelList = [...labelList, label]
        collection[label] = []
      }
    })

    let urls = []

    const annotations = annotationsCsv.split('\n')
    annotations.forEach(annotation => {
      // Account for empty lines.
      if (annotation !== '') {
        const [url, label] = annotation.split(',')
        const trimedLabel = label.trim()

        if (trimedLabel in collection) {
          collection[trimedLabel] = [url, ...collection[trimedLabel]]

          urls = [...urls, url]
        }
      }
    })

    this.collection = collection
    this.labelList = labelList
    this.tmpLabeledImages = new Set(urls)

    return fileList
  })
}

const populateUnlabeled = fileList => {
  // Make sure the extension is an image.
  const imageList = fileList.filter(fileName => fileName.match(IAMGE_REGEX))

  const collection = { ...this.collection }

  imageList.forEach(item => {
    if (!this.tmpLabeledImages.has(item)) {
      collection[UNLABELED] = [...collection[UNLABELED], item]
    }
  })

  this.collection = collection
  return { collection: this.collection, labelList: this.labelList }
}
