import COS from 'api/COS'
// Annotation
// --static--
// - label() -> Label
// - bbox() -> BBox || null
//
// Label
// --static--
// - name -> String
// - count -> Int
//
// BBox
// --static--
// - x -> Float
// - x2 -> Float
// - y -> Float
// - y2 -> Float

class Label {
  #name
  #count
  constructor(name, count) {
    this.#name = name
    this.#count = count
  }

  get name() {
    return this.#name
  }

  get count() {
    return this.#count
  }

  toJSON() {
    return {
      name: this.#name,
      count: this.#count
    }
  }
}

// Collection
// --static--
// - labels() -> [Label]
// - images() -> [String (imageAddress)]
// - images(label) -> [String (imageAddress)]
// - annotations(image) -> [Annotation]
// --mutations--
// - deleteImage(image) -> new ClassificationCollection
// - deleteLabel(label) -> new ClassificationCollection
// - addImage(image) -> new ClassificationCollection
// - addLabel(label) -> new ClassificationCollection
// - clearAnnotations(image) -> new ClassificationCollection
// - appendAnnotation(image, annotationId) -> new ClassificationCollection
// - setAnnotation(image, annotationId) -> new ClassificationCollection
// - removeAnnotation(image, annotationId) -> new ClassificationCollection
const VERSION = '1.0'
export default class Collection {
  static PASCAL_VOC = 'Pascal VOC'
  static WATSON_STUDIO = 'WatsonStudio'
  static SIMPLE_LABEL = 'Simple Label'

  #type = ''
  #labels = []
  #images = {}
  #annotations = {}

  constructor(type, labels, images, annotations) {
    this.#type = type
    this.#labels = labels
    this.#images = images
    this.#annotations = annotations
  }

  static get EMPTY() {
    return new Collection('', [], {}, {})
  }

  static load(endpoint, bucket) {
    const Bucket = new COS(endpoint).bucket(bucket)
    const collectionPromise = noDependency(Bucket.collection())
    const fileListPromise = Bucket.fileList()

    return Promise.all([collectionPromise, fileListPromise]).then(res => {
      const [collection, fileList] = res
      // If collection is empty we probably haven't touched this project before.
      // It could be:
      // - WatsonStudio:
      //    - Read only until they convert the project
      //
      // - ours, but they deleted the _annotations.json file:
      // - external project, with a supported annotation structure:
      //    - Generate an _annotations.json file
      //
      // - external project, with unrecognized annotation structure:
      //    - Load any images in the bucket

      const labeled = collection.images.labeled || []
      const images = fileList.filter(fileName => fileName.match(IMAGE_REGEX))
      const unlabeled = images.filter(image => !labeled.includes(image))
      collection.images.unlabeled = unlabeled
      return collection
    })
  }

  get type() {
    return this.#type
  }

  get labels() {
    return this.#labels
  }

  get images() {
    return this.#images
  }

  get annotations() {
    return this.#annotations
  }

  toJSON() {
    return {
      version: VERSION,
      type: this.#type,
      labels: this.#labels,
      images: this.#images,
      annotations: this.#annotations
    }
  }
}

const IMAGE_REGEX = /.(jpg|jpeg|png)$/i
const noDependency = p => p.catch(() => undefined)
