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
  // We should remove the `bboxes` object and just have `Annotation[]`.
  [key: string]: { bboxes: Annotation[] }
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

  public static load(endpoint: string, bucket: string): Promise<Collection> {
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
      // This works for localization, but will be different for classification.
      const imageAnnotations = this._annotations[image].bboxes.filter(
        a => a.label !== label
      )
      if (imageAnnotations.length !== 0) {
        acc[image] = { bboxes: imageAnnotations }
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

  public addAnnotation(
    image: string,
    annotation: Annotation,
    syncComplete: SyncCallback
  ): Collection {
    setTimeout(syncComplete, 3000)
    return Collection.EMPTY
  }

  public removeAnnotation(
    image: string,
    annotation: Annotation,
    syncComplete: SyncCallback
  ): Collection {
    setTimeout(syncComplete, 3000)
    return Collection.EMPTY
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
