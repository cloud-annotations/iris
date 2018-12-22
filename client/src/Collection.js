import { fetchTest } from 'api/fetchImages'
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
export default class Collection {
  static PASCAL_VOC = 'Pascal VOC'
  static WATSON_STUDIO = 'WatsonStudio'
  static SIMPLE_LABEL = 'Simple Label'
  #type = ''
  #labels = {}
  #annotations = {}
  #images = {}
  constructor(type, images, labels, annotations) {
    this.#type = type
    this.#images.all = images
    this.#labels = labels.map(label => {
      this.#images[label] = annotations[label]
      return new Label(label, annotations[label].length)
    })
  }

  static load(endpoint, bucket) {
    const type = fetchTest(endpoint, bucket).type()
    const fileList = noDependency(fetchTest(endpoint, bucket).fileList())
    const labels = noDependency(fetchTest(endpoint, bucket).labels())
    const annotations = noDependency(fetchTest(endpoint, bucket).annotations())

    return Promise.all([type, fileList, labels, annotations]).then(values => {
      const [type, fileList, labelCsv, annotationsCsv] = values
      const images =
        fileList && fileList.filter(fileName => fileName.match(IMAGE_REGEX))
      const labels =
        labelCsv && labelCsv.split('\n').filter(label => label.trim() !== '')
      const annotationsBase =
        labels &&
        labels.reduce((acc, label) => {
          acc[label] = []
          return acc
        }, {})
      const annotations =
        annotationsCsv &&
        annotationsCsv
          .split('\n')
          .filter(annotation => annotation.trim() !== '')
          .reduce((acc, annotation) => {
            const [image, label] = annotation.split(',')
            acc[label] = [image, ...acc[label]]
            return acc
          }, annotationsBase)
      return {
        type: type.trim(),
        images: images,
        labels: labels,
        annotations: annotations
      }
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
    return this.#images
  }
}

const IMAGE_REGEX = /.(jpg|jpeg|png)$/i
const noDependency = p => p.catch(() => undefined)
