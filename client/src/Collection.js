// {
//   version: '1.0',
//   type: 'localization',
//   labels: ['label1', 'label2'],
//   _images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
//   _COS: 'actual cloud object storage instance',
//   annotations: {
//     'image1.jpg': [
//       {
//         label: 'label1',
//         x: 0,
//         y: 0,
//         x2: 0,
//         y2: 0
//       }
//     ]
//   }
// }
//
// | Ops                             | Effects                | Needs sync
// |---------------------------------|------------------------|------------------
// - setType(newType)                | type                   | yes
// - createLabel(newLabel)           | labels                 | yes
// - deleteLabel(label)              | labels, annotations    | yes
// - uploadImages([data])            | _images                | no
// - deleteImages([image])           | _images, annotations   | yes
// - createBox(image, newBox)        | annotations            | yes
// - deleteBox(image, box)           | annotations            | yes
//
// NOTE: deleteBox, if no more boxes we need to remove the annotation.
//
// - updateBox -> deleteBox + createBox
// - updateLabel -> createLabel + for each label (createBox + deleteBox) + deleteLabel
//
// | Getters
// |----------------------------------------------------------------------------
// - type
// - labels
// - annotations
// - images
// - getLabeledImages(true | false |  'label')
//     - getLabeledImages(true)  -> labeled
//     - getLabeledImages(false) -> unlabeled
//     - getLabeledImages('cat') -> 'cat'

import produce, { immerable } from 'immer'
import COS from './api/COSv2'
import { generateUUID } from 'Utils'

const listAllObjects = async (cos, params) => {
  const recursivelyQuery = async (continuationToken, list = []) => {
    const res = await cos.listObjectsV2({
      ...params,
      ContinuationToken: continuationToken
    })
    const { NextContinuationToken, Contents = [] } = res.ListBucketResult
    const wrappedContents = Array.isArray(Contents) ? Contents : [Contents]
    const currentList = [...list, ...wrappedContents]
    if (NextContinuationToken) {
      return await recursivelyQuery(NextContinuationToken, currentList)
    }
    return currentList
  }
  return await recursivelyQuery()
}

const IMAGE_REGEX = /\.(jpg|jpeg|png)$/i
const optional = (p, alt) => p.catch(() => alt)

const VERSION = '1.0'
export default class Collection {
  [immerable] = true
  type = undefined
  labels = undefined
  images = undefined
  annotations = undefined
  cos = undefined
  bucket = undefined

  constructor(type, labels, images, annotations) {
    this.type = type
    this.labels = labels
    this.images = images
    this.annotations = annotations
  }

  static get EMPTY() {
    return new Collection(undefined, [], [], {})
  }

  static async load(endpoint, bucket) {
    const cos = new COS({ endpoint: endpoint })

    const collectionPromise = optional(
      cos.getObject({
        Bucket: bucket,
        Key: '_annotations.json'
      }),
      { type: undefined, labels: [], images: [], annotations: {} }
    )

    const objectListPromise = listAllObjects(cos, { Bucket: bucket })

    const [collectionJson, objectList] = await Promise.all([
      collectionPromise,
      objectListPromise
    ])

    const fileList = objectList.map(object => object.Key)
    const images = fileList.filter(fileName => fileName.match(IMAGE_REGEX))

    const annotations = produce(collectionJson.annotations, draft => {
      Object.keys(draft).forEach(image => {
        draft[image] = draft[image].map(box => ({ ...box, id: generateUUID() }))
      })
    })

    const collection = new Collection(
      collectionJson.type,
      collectionJson.labels,
      images,
      annotations
    )
    collection.cos = cos
    collection.bucket = bucket

    return collection
  }

  getLabelMapCount() {
    return this.labels.reduce((acc, label) => {
      acc[label] = Object.keys(this.annotations).reduce((acc, image) => {
        acc += this.annotations[image].reduce((acc, annotation) => {
          if (annotation.label === label) {
            acc++
          }
          return acc
        }, 0)
        return acc
      }, 0)
      return acc
    }, {})
  }

  // TODO: Maybe memoize this function.
  getLabeledImages(withLabel) {
    const labeled = Object.keys(this.annotations)
    if (withLabel === true) {
      return labeled
    }

    if (withLabel === false) {
      return this.images.filter(image => !labeled.includes(image))
    }

    return labeled.filter(image =>
      this.annotations[image].find(a => a.label === withLabel)
    )
  }

  setType(type, syncComplete) {
    const collection = produce(this, draft => {
      draft.type = type
    })

    syncBucket(this.cos, this.bucket, collection, syncComplete)
    return collection
  }

  createLabel(newLabel, syncComplete) {
    const collection = produce(this, draft => {
      draft.labels.push(newLabel)
    })

    syncBucket(this.cos, this.bucket, collection, syncComplete)
    return collection
  }

  deleteLabel(label, syncComplete) {
    const collection = produce(this, draft => {
      draft.labels.splice(draft.labels.findIndex(l => l === label), 1)
      // TODO: We might have some interesting corner cases:
      // if someone deletes a label right as we label something with the label.
      Object.keys(draft.annotations).forEach(image => {
        draft.annotations[image] = draft.annotations[image].filter(
          a => a.label !== label
        )
        // Ensure images without annotations are removed.
        if (draft.annotations[image].length === 0) {
          delete draft.annotations[image]
        }
      })
    })

    syncBucket(this.cos, this.bucket, collection, syncComplete)
    return collection
  }

  uploadImages(images, syncComplete) {
    // TODO: Do we need to wait until these requests finish?
    images.forEach(image =>
      this.cos.putObject({
        Bucket: this.bucket,
        Key: image.name,
        Body: image.blob
      })
    )

    const collection = produce(this, draft => {
      const imageNames = images.map(image => image.name)
      draft.images.unshift(...imageNames)
    })

    syncBucket(this.cos, this.bucket, collection, syncComplete)
    return collection
  }

  deleteImages(images, syncComplete) {
    // TODO: Do we need to wait until this request finishes?
    const objects = images.map(image => ({ Key: image }))
    this.cos.deleteObjects({
      Bucket: this.bucket,
      Delete: {
        Objects: objects
      }
    })

    const collection = produce(this, draft => {
      images.forEach(image => {
        draft.images.splice(draft.images.findIndex(i => i === image), 1)
        // TODO: This could possibly cause an undefined error if someone deletes
        // an image when someone else adds a box to the image. We should check
        // if the image exists in `createBox` and `deleteBox`
        delete draft.annotations[image]
      })
    })

    syncBucket(this.cos, this.bucket, collection, syncComplete)
    return collection
  }

  createBox(image, newBox, syncComplete) {
    const collection = produce(this, draft => {
      if (!draft.annotations[image]) {
        draft.annotations[image] = []
      }
      draft.annotations[image].unshift(newBox)
    })

    syncBucket(this.cos, this.bucket, collection, syncComplete)
    return collection
  }

  deleteBox(image, box, syncComplete) {
    const collection = produce(this, draft => {
      draft.annotations[image].splice(
        draft.annotations[image].findIndex(oldBBox => oldBBox.id === box.id),
        1
      )
      if (draft.annotations[image].length === 0) {
        // We don't need to emit a special event for deleting the entire
        // annotation. The annotation will get stripted eventually, because this
        // function will always be called by all clients before syncing.
        delete draft.annotations[image]
      }
    })

    syncBucket(this.cos, this.bucket, collection, syncComplete)
    return collection
  }

  toJSON() {
    return {
      version: VERSION,
      type: this.type,
      labels: this.labels,
      annotations: this.annotations
    }
  }
}

// TODO: We can pass a promise chain here so we can wait for that to complete as
// well.
const syncBucket = async (cos, bucket, collection, syncComplete) => {
  const string = JSON.stringify(collection.toJSON())
  const blob = new Blob([string], { type: 'application/json;charset=utf-8;' })
  await cos.putObject({
    Bucket: bucket,
    Key: '_annotations.json',
    Body: blob
  })
  syncComplete && syncComplete()
}
