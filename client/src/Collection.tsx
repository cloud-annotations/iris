import COS from './api/COS'

const IMAGE_REGEX = /.(jpg|jpeg|png)$/i
const optional = (p: Promise<any>) => p.catch(() => undefined)

type Type = 'classification' | 'localization' | undefined

interface Images {
  all: string[]
  labeled: string[]
  unlabeled: string[]
  [key: string]: string[]
}

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

const VERSION = '1.0'
export default class Collection {
  constructor(
    private _type: Type,
    private _labels: string[],
    private _images: Images,
    private _annotations: Annotations
  ) {
    this._type = _type
    this._labels = _labels
    this._images = _images
    this._annotations = _annotations
  }

  public static get EMPTY() {
    return new Collection(
      undefined,
      [],
      { all: [], labeled: [], unlabeled: [] },
      {}
    )
  }

  public static async load(
    endpoint: string,
    bucket: string
  ): Promise<Collection> {
    const Bucket = new COS(endpoint).bucket(bucket)
    const collectionPromise = optional(Bucket.collection())
    const fileListPromise = Bucket.fileList()
    return Promise.all([collectionPromise, fileListPromise]).then(
      (res: [Collection, string[]]) => {
        const [collection, fileList] = res
        const images = fileList.filter(fileName => fileName.match(IMAGE_REGEX))
        if (collection) {
          const labeled = collection.images.labeled
          const unlabeled = images.filter(image => !labeled.includes(image))
          collection.images.unlabeled = unlabeled
          collection.images.all = [...unlabeled, ...labeled]
          return collection
        } else {
          const newCollection = Collection.EMPTY
          newCollection._images.all = images
          newCollection._images.unlabeled = images
          return newCollection
        }
      }
    )
  }

  public get type(): Type {
    return this._type
  }

  public setType(type: Type, syncComplete: SyncCallback): Collection {
    setTimeout(syncComplete, 3000)
    return new Collection(type, this._labels, this._images, this._annotations)
  }

  public get labels(): string[] {
    return this._labels
  }

  public addLabel(label: string, syncComplete: SyncCallback): Collection {
    setTimeout(syncComplete, 3000)
    const images = { ...this._images }
    images[label] = []
    return new Collection(
      this._type,
      [label, ...this._labels],
      images,
      this._annotations
    )
  }

  public removeLabel(label: string, syncComplete: SyncCallback): Collection {
    setTimeout(syncComplete, 3000)
    const images = { ...this._images }
    delete images[label]
    const labels = this._labels.filter(l => label !== l)
    const labeled = labels.reduce((acc: string[], l: string) => {
      return [...images[l], ...acc]
    }, [])
    const unlabeled = images.all.filter(image => !labeled.includes(image))
    images.labeled = labeled
    images.unlabeled = unlabeled
    const annotations = images.all.reduce((acc: Annotations, image: string) => {
      if (!this._annotations[image]) {
        return acc
      }
      const imageAnnotations = this._annotations[image].filter(
        a => a.label !== label
      )
      if (imageAnnotations.length !== 0) {
        acc[image] = imageAnnotations
      }
      return acc
    }, {})
    return new Collection(this._type, labels, images, annotations)
  }

  public get images(): Images {
    return this._images
  }

  public addImage(image: string, syncComplete: SyncCallback): Collection {
    setTimeout(syncComplete, 3000)
    return Collection.EMPTY
  }

  public removeImage(image: string, syncComplete: SyncCallback): Collection {
    setTimeout(syncComplete, 3000)
    return Collection.EMPTY
  }

  public get annotations(): Annotations {
    return this._annotations
  }

  public setAnnotation(
    image: string,
    annotation: Annotation[],
    syncComplete: SyncCallback
  ): Collection {
    setTimeout(syncComplete, 3000)
    const images = { ...this._images }
    const annotations = { ...this._annotations }

    const oldLabels = (annotations[image] || []).reduce(
      (acc: Set<string>, annotation: Annotation) => {
        acc.add(annotation.label)
        return acc
      },
      new Set()
    )

    const newLabels = annotation.reduce(
      (acc: Set<string>, annotation: Annotation) => {
        acc.add(annotation.label)
        return acc
      },
      new Set()
    )

    const filteredImages = [...oldLabels].reduce(
      (acc: Images, label: string) => {
        // Remove image from any labels that it no longer has.
        if (!newLabels.has(label)) {
          acc[label] = acc[label].filter(i => i !== image)
        }
        return acc
      },
      images
    )

    const addedImages = [...newLabels].reduce((acc: Images, label: string) => {
      // Add image to anything it didn't belong to.
      if (!oldLabels.has(label)) {
        acc[label] = [image, ...acc[label]]
      }
      return acc
    }, filteredImages)

    if (newLabels.size === 0) {
      // The image is now unlabeled, remove it from the labeled category.
      addedImages.labeled = addedImages.labeled.filter(i => i !== image)
      // Add it to the unlabeled category.
      addedImages.unlabeled = [...new Set([...addedImages.unlabeled, image])]
    } else {
      // The image is now labeled, remove it from the unlabeled category.
      addedImages.unlabeled = addedImages.unlabeled.filter(i => i !== image)
      // Add it to the labeled category.
      addedImages.labeled = [...new Set([...addedImages.labeled, image])]
    }

    const cleanedAnnotation = annotation.map(annotation => {
      switch (this._type) {
        case 'localization':
          return {
            x: annotation.x,
            x2: annotation.x2,
            y: annotation.y,
            y2: annotation.y2,
            label: annotation.label
          }
        case 'classification':
        default:
          return { label: annotation.label }
      }
    })

    annotations[image] = cleanedAnnotation
    return new Collection(this._type, this._labels, addedImages, annotations)
  }

  toJSON() {
    return {
      version: VERSION,
      type: this._type,
      labels: this._labels,
      images: this._images,
      annotations: this._annotations
    }
  }
}
