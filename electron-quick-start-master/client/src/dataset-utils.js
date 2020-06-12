import JSZip from 'jszip'

import Collection, { IMAGE_REGEX } from 'Collection'

export const importDataset = async zipFile => {
  return JSZip.loadAsync(zipFile).then(async zip => {
    const cleanedFiles = zip.filter(path => !path.startsWith('__MACOSX/'))

    const images = cleanedFiles.filter(file => file.name.match(IMAGE_REGEX))

    const annotations = cleanedFiles.find(file =>
      file.name.endsWith('_annotations.json')
    )

    let basePath = ''
    if (annotations !== undefined) {
      basePath = annotations.name.substring(
        0,
        annotations.name.length - '_annotations.json'.length
      )
    }

    const imageUploadPromises = images.map(file => {
      return file.async('blob').then(blob => ({
        name: file.name.substring(basePath.length, file.name.length),
        blob: blob
      }))
    })

    const files = await Promise.all(imageUploadPromises)

    let annotationsJSON = Collection.EMPTY
    if (annotations !== undefined) {
      annotationsJSON = JSON.parse(await annotations.async('string'))
    }

    return [files, annotationsJSON]
  })
}
