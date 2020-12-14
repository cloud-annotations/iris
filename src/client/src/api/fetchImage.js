import localforage from 'localforage'

import COS from './COSv2'

const shrinkBlob = async (blob, height) => {
  return new Promise((resolve, _) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.height = height
      canvas.width = canvas.height * (img.width / img.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      ctx.canvas.toBlob((blob) => {
        resolve(blob)
      })
    }
    img.src = URL.createObjectURL(blob)
  })
}

export default async (endpoint, bucket, imageUrl, forcedHeight) => {
  try {
    let blob

    // Only check cache if we force the height.
    if (forcedHeight) {
      blob = await localforage.getItem(imageUrl)
    }

    if (
      blob === undefined ||
      blob === null ||
      blob === '' ||
      !(blob instanceof Blob)
    ) {
      blob = await new COS({ endpoint: endpoint }).getObject({
        Bucket: bucket,
        Key: imageUrl,
      })

      if (
        !blob.type.startsWith('image/') &&
        !blob.type.startsWith('application/octet-stream')
      ) {
        // If responce isn't an image, try 4 more times, 500, 1000, 2000, 3000.
        await new Promise((resolve, _) => {
          const recursiveRetry = (wait, tries) => {
            setTimeout(async () => {
              blob = await new COS({ endpoint: endpoint }).getObject({
                Bucket: bucket,
                Key: imageUrl,
              })
              if (blob.type.startsWith('image/') || tries === 0) {
                resolve()
              } else {
                recursiveRetry((4 - tries) * 1000, tries - 1)
              }
            }, wait)
          }
          recursiveRetry(500, 3)
        })
      }

      // If still isn't an image don't save it.
      if (forcedHeight && blob.type.startsWith('image/')) {
        blob = await shrinkBlob(blob, forcedHeight)
        // Let's only cache if the image is small.
        localforage.setItem(imageUrl, blob)
      }
    }

    return { image: URL.createObjectURL(blob) }
  } catch {}
}
