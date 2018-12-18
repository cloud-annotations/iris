import localforage from 'localforage'
import { handleErrors, arrayBufferToBase64 } from 'Utils'

export default (endpoint, bucket, imageUrl) => {
  const annotationUrl =
    imageUrl.slice(
      0,
      (Math.max(0, imageUrl.lastIndexOf('.')) || Infinity) + 1
    ) + 'xml'
  const baseUrl = `/api/proxy/${endpoint}/${bucket}/_annotations/${annotationUrl}`
  return fetch(baseUrl)
    .then(handleErrors)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then(data => {
      const size = data.getElementsByTagName('size')[0]
      const width = data.getElementsByTagName('width')[0].innerHTML
      const height = data.getElementsByTagName('height')[0].innerHTML
      const objects = data.getElementsByTagName('object')
      const bboxes = Array.prototype.map.call(objects, element => {
        const label = element.getElementsByTagName('name')[0].innerHTML
        const bbox = element.getElementsByTagName('bndbox')[0]
        const x = bbox.getElementsByTagName('xmin')[0].innerHTML / width
        const y = bbox.getElementsByTagName('ymin')[0].innerHTML / height
        const x2 = bbox.getElementsByTagName('xmax')[0].innerHTML / width
        const y2 = bbox.getElementsByTagName('ymax')[0].innerHTML / height
        return { x: x, y: y, x2: x2, y2: y2, label: label }
      })
      return { bboxes: bboxes }
    })
}
