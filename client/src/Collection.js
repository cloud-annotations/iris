import { fetchTest } from 'api/fetchImages'
import fetchAnnotation from 'api/fetchAnnotation'
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
    const type = fetchTest(endpoint, bucket).type()
    const fileList = noDependency(fetchTest(endpoint, bucket).fileList())
    const labels = noDependency(fetchTest(endpoint, bucket).labels())
    const annotations = noDependency(fetchTest(endpoint, bucket).annotations())

    return Promise.all([type, fileList, labels, annotations]).then(values => {
      const [dirtyType, fileList, labelsCsv, annotationsCsv] = values

      const type = dirtyType.trim()

      const images =
        fileList && fileList.filter(fileName => fileName.match(IMAGE_REGEX))

      const labelNames =
        labelsCsv && labelsCsv.split('\n').filter(label => label.trim() !== '')

      // TODO: We need to add the unlabeled images as well

      switch (type) {
        case Collection.PASCAL_VOC:
          return doEverything(endpoint, bucket)
        // return localizationAnnotations(
        //   endpoint,
        //   bucket,
        //   images,
        //   labelNames
        // ).then(annotations => {
        //   const { imagesForAnnotation, annotationsForImage } = annotations
        //   const labels =
        //     labelNames &&
        //     labelNames.map(label => {
        //       return new Label(label, imagesForAnnotation[label].length)
        //     })
        //   imagesForAnnotation.all = images
        //   return {
        //     type: type,
        //     labels: labels,
        //     images: imagesForAnnotation,
        //     annotations: annotationsForImage
        //   }
        // })
        case Collection.WATSON_STUDIO:
        case Collection.SIMPLE_LABEL:
          const {
            imagesForAnnotation,
            annotationsForImage
          } = classificationAnnotations(annotationsCsv, images, labelNames)
          const labels =
            labelNames &&
            labelNames.map(label => {
              return new Label(label, imagesForAnnotation[label].length)
            })
          imagesForAnnotation.all = images
          return {
            type: type,
            labels: labels,
            images: imagesForAnnotation,
            annotations: annotationsForImage
          }
        default:
          return Promise.reject('Unrecognized annotation type')
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
    return this.#annotations
  }

  toJSON() {
    return {
      type: this.#type,
      labels: this.#labels,
      images: this.#images,
      annotations: this.#annotations
    }
  }
}

const doEverything = (endpoint, bucket) => {
  const baseUrl = `/api/proxy/${endpoint}/${bucket}/_annotations.json`
  return fetch(baseUrl)
    .then(response => response.json())
    .then(json => {
      return {
        type: json.type,
        labels: json.labels,
        images: json.images,
        annotations: json.annotations
      }
    })
}

const localizationAnnotations = (endpoint, bucket, images, labels) => {
  const annotationsPromise = images.map(image =>
    noDependency(fetchAnnotation(endpoint, bucket, image))
  )
  return Promise.all(annotationsPromise).then(values => {
    const imagesForAnnotation =
      labels &&
      labels.reduce((acc, label) => {
        acc[label] = []
        return acc
      }, {})

    const annotationsForImage = values.reduce((acc, annotation, i) => {
      if (!annotation) {
        return acc
      }
      annotation.bboxes.forEach(bbox => {
        imagesForAnnotation[bbox.label] = [
          images[i],
          ...imagesForAnnotation[bbox.label]
        ]
      })
      acc[images[i]] = annotation
      return acc
    }, {})
    return {
      imagesForAnnotation: imagesForAnnotation,
      annotationsForImage: annotationsForImage
    }
  })
}

const classificationAnnotations = (annotationsCsv, images, labels) => {
  const annotationsBase =
    labels &&
    labels.reduce((acc, label) => {
      acc[label] = []
      return acc
    }, {})
  const imagesForAnnotation =
    annotationsCsv &&
    annotationsCsv
      .split('\n')
      .filter(annotation => annotation.trim() !== '')
      .reduce((acc, annotation) => {
        const [image, label] = annotation.split(',')

        acc[label] = [image, ...acc[label]]
        return acc
      }, annotationsBase)

  const annotationsForImage = labels.reduce((acc, label) => {
    imagesForAnnotation[label].forEach(image => {
      acc[image] = label
    })
    return acc
  }, {})
  return {
    imagesForAnnotation: imagesForAnnotation,
    annotationsForImage: annotationsForImage
  }
}

const IMAGE_REGEX = /.(jpg|jpeg|png)$/i
const noDependency = p => p.catch(() => undefined)
