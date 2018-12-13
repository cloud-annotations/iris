import { generateUUID, handleErrors } from 'Utils'

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

/////////////////////////////
// Needs to happen in app. //
/////////////////////////////
// If the user has one of the label tabs selected, we need to upload the
// images directly to that label
// const label =
//   this.state.currentSection === UNLABELED ||
//   this.state.currentSection === LABELED ||
//   this.state.currentSection === ALL_IMAGES
//     ? 'Unlabeled'
//     : this.state.currentSection
//
// // Inject temporary file names into the collection to make empty tiles show
// // while the actual images are loading.
// this.setState(prevState => {
//   const newCollection = { ...prevState.collection }
//
//   filesWithNames.forEach(fileWithName => {
//     newCollection[label] = [
//       `tmp_${fileWithName.fileName}`,
//       ...newCollection[label]
//     ]
//   })
//
//   const newSelection = Object.keys(newCollection).reduce((acc, key) => {
//     return [...acc, ...newCollection[key].map(() => false)]
//   }, [])
//
//   return {
//     collection: newCollection,
//     selection: newSelection
//   }
// })
//
// // Loop through each image and shrink it down and extract the image data
// // then pull out the tmp tags to reveal the actual image.
// // Then upload it to the server.
// var uploadRequests = []
// filesWithNames.forEach(fileWithName => {
//   const fileName = fileWithName.fileName
//   const file = fileWithName.file
//   const promise = readFile(file)
//     .then(image => shrinkImage(image))
//     .then(canvas => {
//       const dataURL = canvas.toDataURL('image/jpeg')
//       return localforage.setItem(fileName, dataURL).then(() => {
//         return new Promise((resolve, reject) => {
//           this.setState(
//             prevState => {
//               const newCollection = { ...prevState.collection }
//               newCollection[label] = newCollection[label].map(image => {
//                 if (image === `tmp_${fileName}`) {
//                   return fileName
//                 }
//                 return image
//               })
//
//               return {
//                 collection: newCollection
//               }
//             },
//             () => {
//               resolve(canvas)
//             }
//           )
//         })
//       })
//     })
//       .then(canvas => canvasToBlob(canvas))
//
// .then(() => this.annotationsToCsv())
