import localforage from 'localforage'
import { handleErrors, arrayBufferToBase64 } from 'Utils'

export default async (endpoint, bucket, imageUrl, forcedHeight) => {
  const baseUrl = `/api/proxy/${endpoint}/${bucket}/${imageUrl}`
  let blob = await localforage.getItem(imageUrl)

  if (blob === null || blob === '') {
    blob = await fetch(baseUrl)
      .then(handleErrors)
      .then(response => response.blob())
    localforage.setItem(imageUrl, blob)
  }

  return { image: URL.createObjectURL(blob) }

  // return localforage.getItem(imageUrl).then(data => {
  //   if (data === null || data === '') {
  //     return fetch(baseUrl)
  //       .then(handleErrors)
  //       .then(response => response.arrayBuffer())
  //       .then(buffer => {
  //         new Blob([buffer])

  //         URL.createObjectURL(blob)

  //         localforage.setItem(imageUrl, base64Image)
  //         return { image: base64Image }

  //         // const base64Flag = 'data:image/jpeg;base64,'
  //         // const base64Image = base64Flag + arrayBufferToBase64(buffer)

  //         // if (forcedHeight) {
  //         //   return new Promise((resolve, reject) => {
  //         //     const img = new Image()
  //         //     img.onload = function() {
  //         //       const canvas = document.createElement('canvas')
  //         //       const ctx = canvas.getContext('2d')
  //         //       canvas.height = forcedHeight
  //         //       canvas.width = canvas.height * (img.width / img.height)
  //         //       ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  //         //       const data = canvas.toDataURL('image/png')
  //         //       localforage.setItem(imageUrl, data)
  //         //       resolve({ image: data })
  //         //     }
  //         //     img.src = base64Image
  //         //   })
  //         // } else {
  //         //   localforage.setItem(imageUrl, base64Image)
  //         //   return { image: base64Image }
  //         // }
  //       })
  //   } else {
  //     return { image: data }
  //   }
  // })
}
