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
import COS from './api/COS'

const IMAGE_REGEX = /\.(jpg|jpeg|png)$/i
const optional = <T>(p: Promise<T>, alt: T) => p.catch(() => alt)

type Type = 'classification' | 'localization' | undefined

interface Annotation {
  x?: number
  y?: number
  x2?: number
  y2?: number
  label: string
}

interface Annotations {
  [key: string]: Annotation[]
}

type SyncCallback = () => void
type UpdatedCollectionCallback = (collection: Collection) => void

const VERSION = '1.0'
export default class Collection {
  [immerable] = true
  public cos: any = undefined

  constructor(
    public type: Type,
    public labels: string[],
    public images: string[],
    public annotations: Annotations,
    endpoint?: string,
    bucket?: string
  ) {
    if (endpoint && bucket) {
      this.cos = new COS(endpoint).bucket(bucket)
    }
  }

  public static get EMPTY() {
    return new Collection(undefined, [], [], {})
  }

  public static async load(
    endpoint: string,
    bucket: string
  ): Promise<Collection> {
    const Bucket = new COS(endpoint).bucket(bucket)
    const collectionPromise = optional(Bucket.collection(), Collection.EMPTY)
    const fileListPromise = Bucket.fileList()

    const [collection, fileList] = await Promise.all([
      collectionPromise,
      fileListPromise
    ])

    const images = fileList.filter((fileName: string) =>
      fileName.match(IMAGE_REGEX)
    )

    collection.images = images
    collection.cos = Bucket

    return collection
  }

  // TODO: Memoize this function.
  public getLabeledImages(withLabel: string | boolean): string[] {
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

  public setType(type: Type, syncComplete: SyncCallback): Collection {
    const collection = produce(this as Collection, draft => {
      draft.type = type
    })

    syncBucket(this.cos, collection, syncComplete)
    return collection
  }

  public createLabel(newLabel: string, syncComplete: SyncCallback): Collection {
    const collection = produce(this as Collection, draft => {
      draft.labels.push(newLabel)
    })

    syncBucket(this.cos, collection, syncComplete)
    return collection
  }

  public deleteLabel(label: string, syncComplete: SyncCallback): Collection {
    const collection = produce(this as Collection, draft => {
      draft.labels.splice(draft.labels.findIndex(l => l === label), 1)
      // TODO: We might have some interesting corner cases:
      // if someone deletes a label right as we label something with the label.
      Object.keys(draft.annotations).forEach(image => {
        draft.annotations[image] = draft.annotations[image].filter(
          a => a.label !== label
        )
      })
    })

    syncBucket(this.cos, collection, syncComplete)
    return collection
  }

  public uploadImages(
    images: string[],
    syncComplete: SyncCallback
  ): Collection {
    // TODO: We need to actually upload the images first.
    const collection = produce(this as Collection, draft => {
      draft.images.push(...images)
    })

    syncBucket(this.cos, collection, syncComplete)
    return collection
  }

  public deleteImages(
    images: string[],
    syncComplete: SyncCallback
  ): Collection {
    // TODO: We need to actually delete the images first.
    const collection = produce(this as Collection, draft => {
      images.forEach(image => {
        draft.images.splice(draft.images.findIndex(i => i === image), 1)
        // TODO: This could possibly cause an undefined error if someone deletes
        // an image when someone else adds a box to the image. We should check
        // if the image exists in `createBox` and `deleteBox`
        delete draft.annotations[image]
      })
    })

    syncBucket(this.cos, collection, syncComplete)
    return collection
  }

  public createBox(
    image: string,
    newBox: Annotation,
    syncComplete: SyncCallback
  ): Collection {
    const collection = produce(this as Collection, draft => {
      draft.annotations[image].push(newBox)
    })

    syncBucket(this.cos, collection, syncComplete)
    return collection
  }

  public deleteBox(
    image: string,
    box: Annotation,
    syncComplete: SyncCallback
  ): Collection {
    const collection = produce(this as Collection, draft => {
      draft.annotations[image].splice(
        draft.annotations[image].findIndex(
          oldBBox =>
            oldBBox.x === box.x &&
            oldBBox.x2 === box.x2 &&
            oldBBox.y === box.y &&
            oldBBox.y2 === box.y2 &&
            oldBBox.label === box.label
        ),
        1
      )
      if (draft.annotations[image].length === 0) {
        // We don't need to emit a special event for deleting the entire
        // annotation. The annotation will get stripted eventually, because this
        // function will always be called by all clients before syncing.
        delete draft.annotations[image]
      }
    })

    syncBucket(this.cos, collection, syncComplete)
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

const syncBucket = async (
  bucket: any,
  collection: Collection,
  syncComplete: SyncCallback
) => {
  if (syncComplete) {
    const string = JSON.stringify(collection.toJSON())
    const b = new Blob([string], { type: 'application/json;charset=utf-8;' })
    await bucket.putFile({ name: '_annotations.json', blob: b })
    syncComplete()
  }
}
