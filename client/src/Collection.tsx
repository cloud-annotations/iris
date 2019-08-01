import localforage from 'localforage'
import produce, { immerable } from 'immer'
import COS from './api/COS'
import {
  generateUUID,
  readFile,
  namedCanvasToFile,
  imageToCanvas,
  convertToJpeg
} from './Utils'

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
type UpdatedCollectionCallback = (collection: Collection) => void

const VERSION = '1.0'
export default class Collection {
  [immerable] = true
  public _bucket: any = undefined

  constructor(
    public _type: Type,
    public _labels: string[],
    public _images: Images,
    public _annotations: Annotations,
    endpoint?: string,
    bucket?: string
  ) {
    this._type = _type
    this._labels = _labels
    this._images = _images
    this._annotations = _annotations
    if (endpoint && bucket) {
      this._bucket = new COS(endpoint).bucket(bucket)
    }
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
          collection.images.labeled = labeled
          collection.images.unlabeled = unlabeled
          collection.images.all = [...unlabeled, ...labeled]
          return new Collection(
            collection.type,
            collection.labels,
            collection.images,
            collection.annotations,
            endpoint,
            bucket
          )
        } else {
          const newCollection = Collection.EMPTY
          newCollection._images.all = images
          newCollection._images.unlabeled = images
          return new Collection(
            newCollection.type,
            newCollection.labels,
            newCollection.images,
            newCollection.annotations,
            endpoint,
            bucket
          )
        }
      }
    )
  }

  public get type(): Type {
    return this._type
  }

  public get labels(): string[] {
    return this._labels
  }

  public get images(): Images {
    return this._images
  }

  public get annotations(): Annotations {
    return this._annotations
  }

  // public addLabel(label: string, syncComplete: SyncCallback): Collection {
  //   if (
  //     this._labels.includes(label) ||
  //     label.toLowerCase() === 'all' ||
  //     label.toLowerCase() === 'unlabeled' ||
  //     label.toLowerCase() === 'labeled'
  //   ) {
  //     throw new Error('Illegal label name')
  //   }
  //   const images = { ...this._images }
  //   images[label] = []
  //   const collection = new Collection(
  //     this._type,
  //     [label, ...this._labels],
  //     images,
  //     this._annotations
  //   )
  //   collection._bucket = this._bucket
  //   if (syncComplete) {
  //     this._syncBucket(collection, syncComplete)
  //   }
  //   return collection
  // }

  // public removeLabel(label: string, syncComplete: SyncCallback): Collection {
  //   const images = { ...this._images }
  //   delete images[label]
  //   const labels = this._labels.filter(l => label !== l)
  //   const labeled = labels.reduce((acc: string[], l: string) => {
  //     return [...images[l], ...acc]
  //   }, [])
  //   const unlabeled = images.all.filter(image => !labeled.includes(image))
  //   images.labeled = labeled
  //   images.unlabeled = unlabeled
  //   const annotations = images.all.reduce((acc: Annotations, image: string) => {
  //     if (!this._annotations[image]) {
  //       return acc
  //     }
  //     const imageAnnotations = this._annotations[image].filter(
  //       a => a.label !== label
  //     )
  //     if (imageAnnotations.length !== 0) {
  //       acc[image] = imageAnnotations
  //     }
  //     return acc
  //   }, {})
  //   const collection = new Collection(this._type, labels, images, annotations)
  //   collection._bucket = this._bucket
  //   if (syncComplete) {
  //     this._syncBucket(collection, syncComplete)
  //   }
  //   return collection
  // }

  // public addVideo(
  //   videoFile: any,
  //   fps: number,
  //   onFrameLoaded: UpdatedCollectionCallback,
  //   syncComplete: SyncCallback
  // ): void {
  //   const fileURL = URL.createObjectURL(videoFile)
  //   new Promise<HTMLVideoElement>((resolve, _) => {
  //     const video = document.createElement('video')
  //     video.onloadeddata = () => {
  //       resolve(video)
  //     }
  //     video.src = fileURL
  //   })
  //     .then(video => {
  //       const getCanvasForTime = (
  //         video: HTMLVideoElement,
  //         time: number,
  //         canvases: HTMLCanvasElement[]
  //       ) => {
  //         return new Promise<HTMLCanvasElement[]>((resolve, _) => {
  //           video.onseeked = () => {
  //             const c = window.document.createElement('canvas')
  //             const ctx = c.getContext('2d')
  //             c.width = video.videoWidth
  //             c.height = video.videoHeight
  //             if (ctx) {
  //               ctx.drawImage(video, 0, 0, c.width, c.height)
  //             }
  //             resolve([...canvases, c])
  //           }
  //           video.currentTime = time
  //         })
  //       }

  //       if (!isNaN(video.duration)) {
  //         return [...new Array(Math.floor(video.duration * fps))].reduce(
  //           (acc, _, i) => {
  //             return acc.then((canvases: HTMLCanvasElement[]) =>
  //               getCanvasForTime(video, i / fps, canvases)
  //             )
  //           },
  //           Promise.resolve([])
  //         )
  //       }
  //     })
  //     .then((canvases: HTMLCanvasElement[]) => {
  //       const canvasNames = canvases.map(() => {
  //         const name = `${generateUUID()}.jpg`
  //         return name
  //       })
  //       const namedCanvases = canvasNames.map((name, i) => {
  //         return { canvas: canvases[i], name: name }
  //       })
  //       const promises = canvasNames.map((name, i) => {
  //         const dataURL = canvases[i].toDataURL('image/jpeg')
  //         return localforage.setItem(name, dataURL)
  //       })
  //       const collection = (() => {
  //         const images = {
  //           ...this._images,
  //           all: [...canvasNames, ...this._images.all],
  //           unlabeled: [...canvasNames, ...this._images.unlabeled]
  //         }
  //         return new Collection(
  //           this._type,
  //           this._labels,
  //           images,
  //           this._annotations
  //         )
  //       })()
  //       return new Promise<any>((resolve, _) => {
  //         Promise.all(promises).then(() => {
  //           resolve({ collection: collection, namedCanvases: namedCanvases })
  //         })
  //       })
  //     })
  //     .then(res => {
  //       const { collection, namedCanvases } = res
  //       // We don't need to sync the collection
  //       collection._bucket = this._bucket
  //       onFrameLoaded(collection)
  //       const toFilePromises = namedCanvases.map((namedCanvas: any) =>
  //         namedCanvasToFile(namedCanvas)
  //       )
  //       return Promise.all(toFilePromises)
  //     })
  //     .then(images => this._bucket.putImages(images))
  //     .then(() => {
  //       syncComplete()
  //       return
  //     })
  //     .catch(error => {
  //       console.error(error)
  //     })
  // }

  // public addImages(
  //   images: string[],
  //   label: string,
  //   onFileLoaded: UpdatedCollectionCallback,
  //   syncComplete: SyncCallback
  // ): Collection {
  //   // Create a new collection padded with unique throw-away file names.
  //   // These pseudo names can be used as keys when rendering lists in React.
  //   const tmpNames = images.map(() => `${generateUUID()}.tmp`)

  //   // Add the new images to "all images" and "unlabeled"
  //   let collection = produce(this as Collection, draft => {
  //     draft._images.all.unshift(...tmpNames)
  //     draft._images.unlabeled.unshift(...tmpNames)
  //   })

  //   // give all the images a real name.
  //   const namedImages = images.map(async image => ({
  //     blob: await convertToJpeg(image),
  //     name: `${generateUUID()}.jpg`
  //   }))

  //   // Cache the images in indexedDB.
  //   const cacheImagesInLocalStorage = namedImages.map(async namedImage => {
  //     const loadedNamedImage = await namedImage

  //     // Add the jpeg to indexedDB.
  //     await localforage.setItem(loadedNamedImage.name, loadedNamedImage.blob)

  //     // Replace a random temp image with a the loaded image.
  //     collection = produce(collection, draft => {
  //       const tmpName = draft._images.all.find(i => i.endsWith('.tmp'))
  //       if (tmpName) {
  //         const allIndex = draft._images.all.indexOf(tmpName)
  //         const unlabeledIndex = draft._images.unlabeled.indexOf(tmpName)
  //         draft._images.all[allIndex] = loadedNamedImage.name
  //         draft._images.unlabeled[unlabeledIndex] = loadedNamedImage.name
  //       }
  //     })

  //     // TODO: The main selected image won't actually load until the file is in object
  //     // storage because it doesn't pull from cache, we need to somehow re-notify
  //     // the image.
  //     onFileLoaded(collection)
  //     return loadedNamedImage
  //   })

  //   Promise.all(cacheImagesInLocalStorage).then(async files => {
  //     await this._bucket.putImages(files)
  //     syncComplete()
  //   })

  //   return collection
  // }

  // public updateImages(image: [string]): Collection {
  //   const images = {
  //     ...this._images,
  //     all: [...image, ...this._images.all],
  //     unlabeled: [...image, ...this._images.unlabeled]
  //   }
  //   const collection = new Collection(
  //     this._type,
  //     this._labels,
  //     images,
  //     this._annotations
  //   )
  //   collection._bucket = this._bucket
  //   return collection
  // }

  // public deleteImages(
  //   imageIds: [string],
  //   syncComplete: SyncCallback
  // ): Collection {
  //   const labels = [...this._labels]

  //   const oldImages = { ...this._images }
  //   const images = Object.keys(oldImages).reduce((acc, key) => {
  //     acc[key] = oldImages[key].filter(image => !imageIds.includes(image))
  //     return acc
  //   }, oldImages)

  //   const annotations = { ...this._annotations }
  //   imageIds.forEach(imageId => {
  //     delete annotations[imageId]
  //   })

  //   const collection = new Collection(this._type, labels, images, annotations)
  //   collection._bucket = this._bucket

  //   collection._bucket.deleteFiles(imageIds).then(() => {
  //     if (syncComplete) {
  //       this._syncBucket(collection, syncComplete)
  //     }
  //   })

  //   return collection
  // }

  // public setAnnotation(
  //   image: string,
  //   annotation: Annotation[],
  //   syncComplete: SyncCallback
  // ): Collection {
  //   const collection = this.localSetAnnotation(image, annotation)
  //   if (syncComplete) {
  //     this._syncBucket(collection, syncComplete)
  //   }
  //   return collection
  // }

  // public localSetAnnotation(
  //   image: string,
  //   annotation: Annotation[]
  // ): Collection {
  //   const UNTITLED = 'Untitled Label'

  //   annotation.forEach(annotation => {
  //     if (
  //       annotation.label &&
  //       (annotation.label.toLowerCase() === 'all' ||
  //         annotation.label.toLowerCase() === 'unlabeled' ||
  //         annotation.label.toLowerCase() === 'labeled')
  //     ) {
  //       throw new Error('Illegal label name')
  //     }
  //   })

  //   const images = { ...this._images }
  //   const annotations = { ...this._annotations }

  //   let labels = [...this._labels]
  //   annotation = annotation.map(annotation => {
  //     if (!annotation.label) {
  //       annotation.label = UNTITLED
  //       if (!this._labels.includes(UNTITLED)) {
  //         images[UNTITLED] = []
  //         labels = [UNTITLED, ...this._labels]
  //       }
  //     }
  //     return annotation
  //   })

  //   const oldLabels = (annotations[image] || []).reduce(
  //     (acc: Set<string>, annotation: Annotation) => {
  //       acc.add(annotation.label)
  //       return acc
  //     },
  //     new Set()
  //   )

  //   const newLabels = annotation.reduce(
  //     (acc: Set<string>, annotation: Annotation) => {
  //       acc.add(annotation.label)
  //       return acc
  //     },
  //     new Set()
  //   )

  //   const filteredImages = [...oldLabels].reduce(
  //     (acc: Images, label: string) => {
  //       // Remove image from any labels that it no longer has.
  //       if (!newLabels.has(label)) {
  //         acc[label] = acc[label].filter(i => i !== image)
  //       }
  //       return acc
  //     },
  //     images
  //   )

  //   const addedImages = [...newLabels].reduce((acc: Images, label: string) => {
  //     // Add image to anything it didn't belong to.
  //     if (!oldLabels.has(label)) {
  //       acc[label] = [image, ...acc[label]]
  //     }
  //     return acc
  //   }, filteredImages)

  //   if (newLabels.size === 0) {
  //     // The image is now unlabeled, remove it from the labeled category.
  //     addedImages.labeled = addedImages.labeled.filter(i => i !== image)
  //     // Add it to the unlabeled category.
  //     addedImages.unlabeled = [...new Set([image, ...addedImages.unlabeled])]
  //   } else {
  //     // The image is now labeled, remove it from the unlabeled category.
  //     addedImages.unlabeled = addedImages.unlabeled.filter(i => i !== image)
  //     // Add it to the labeled category.
  //     addedImages.labeled = [...new Set([image, ...addedImages.labeled])]
  //   }

  //   const cleanedAnnotation = annotation.map(annotation => {
  //     switch (this._type) {
  //       case 'localization':
  //         return {
  //           x: annotation.x,
  //           x2: annotation.x2,
  //           y: annotation.y,
  //           y2: annotation.y2,
  //           label: annotation.label
  //         }
  //       case 'classification':
  //       default:
  //         return { label: annotation.label }
  //     }
  //   })

  //   annotations[image] = cleanedAnnotation

  //   Object.keys(annotations).forEach(key => {
  //     if (annotations[key].length === 0) {
  //       delete annotations[key]
  //     }
  //   })
  //   const collection = new Collection(
  //     this._type,
  //     labels,
  //     addedImages,
  //     annotations
  //   )
  //   collection._bucket = this._bucket
  //   return collection
  // }

  // public labelImages(
  //   images: string[],
  //   labelName: string,
  //   syncComplete: SyncCallback
  // ): Collection {
  //   if (
  //     labelName.toLowerCase() === 'all' ||
  //     labelName.toLowerCase() === 'unlabeled' ||
  //     labelName.toLowerCase() === 'labeled'
  //   ) {
  //     throw new Error('Illegal label name')
  //   }

  //   const oldImages = { ...this._images }

  //   const labels = (() => {
  //     if (!this._labels.includes(labelName)) {
  //       oldImages[labelName] = []
  //       return [labelName, ...this._labels]
  //     }
  //     return [...this._labels]
  //   })()

  //   const annotations = { ...this._annotations }

  //   const oldLabels = images.map(image => annotations[image])

  //   const newImages = oldLabels.reduce((acc, oldLabel, i) => {
  //     if (!oldLabel) {
  //       return acc
  //     }
  //     const imagesForAnnotation = acc[oldLabel[0].label].filter(
  //       image => image !== images[i]
  //     )
  //     acc[oldLabel[0].label] = imagesForAnnotation
  //     return acc
  //   }, oldImages)

  //   newImages[labelName] = [...new Set([...images, ...oldImages[labelName]])]

  //   const unlabeled = oldImages.unlabeled.filter(
  //     image => !images.includes(image)
  //   )
  //   newImages.unlabeled = unlabeled
  //   const labeled = [...new Set([...images, ...oldImages.labeled])]
  //   newImages.labeled = labeled

  //   images.forEach(image => {
  //     annotations[image] = [{ label: labelName }]
  //   })
  //   const collection = new Collection(
  //     this._type,
  //     labels,
  //     newImages,
  //     annotations
  //   )
  //   collection._bucket = this._bucket
  //   if (syncComplete) {
  //     this._syncBucket(collection, syncComplete)
  //   }
  //   return collection
  // }

  // public unlabelImages(
  //   images: string[],
  //   syncComplete: SyncCallback
  // ): Collection {
  //   const oldImages = { ...this._images }
  //   const annotations = { ...this._annotations }

  //   const oldLabels = images.map(image => annotations[image])

  //   const newImages = oldLabels.reduce((acc, oldLabel, i) => {
  //     if (!oldLabel) {
  //       return acc
  //     }
  //     const imagesForAnnotation = acc[oldLabel[0].label].filter(
  //       image => image !== images[i]
  //     )
  //     acc[oldLabel[0].label] = imagesForAnnotation
  //     return acc
  //   }, oldImages)

  //   const labeled = oldImages.labeled.filter(image => !images.includes(image))
  //   newImages.labeled = labeled
  //   const unlabeled = [...new Set([...images, ...oldImages.unlabeled])]
  //   newImages.unlabeled = unlabeled

  //   const collection = new Collection(
  //     this._type,
  //     this._labels,
  //     newImages,
  //     annotations
  //   )
  //   collection._bucket = this._bucket
  //   if (syncComplete) {
  //     this._syncBucket(collection, syncComplete)
  //   }
  //   return collection
  // }

  // public localSetAnnotation(
  //   image: string,
  //   annotation: Annotation[]
  // ): Collection {
  //   const UNTITLED = 'Untitled Label'

  //   annotation.forEach(annotation => {
  //     if (
  //       annotation.label &&
  //       (annotation.label.toLowerCase() === 'all' ||
  //         annotation.label.toLowerCase() === 'unlabeled' ||
  //         annotation.label.toLowerCase() === 'labeled')
  //     ) {
  //       throw new Error('Illegal label name')
  //     }
  //   })

  //   const images = { ...this._images }
  //   const annotations = { ...this._annotations }

  //   let labels = [...this._labels]
  //   annotation = annotation.map(annotation => {
  //     if (!annotation.label) {
  //       annotation.label = UNTITLED
  //       if (!this._labels.includes(UNTITLED)) {
  //         images[UNTITLED] = []
  //         labels = [UNTITLED, ...this._labels]
  //       }
  //     }
  //     return annotation
  //   })

  //   const oldLabels = (annotations[image] || []).reduce(
  //     (acc: Set<string>, annotation: Annotation) => {
  //       acc.add(annotation.label)
  //       return acc
  //     },
  //     new Set()
  //   )

  //   const newLabels = annotation.reduce(
  //     (acc: Set<string>, annotation: Annotation) => {
  //       acc.add(annotation.label)
  //       return acc
  //     },
  //     new Set()
  //   )

  //   const filteredImages = [...oldLabels].reduce(
  //     (acc: Images, label: string) => {
  //       // Remove image from any labels that it no longer has.
  //       if (!newLabels.has(label)) {
  //         acc[label] = acc[label].filter(i => i !== image)
  //       }
  //       return acc
  //     },
  //     images
  //   )

  //   const addedImages = [...newLabels].reduce((acc: Images, label: string) => {
  //     // Add image to anything it didn't belong to.
  //     if (!oldLabels.has(label)) {
  //       acc[label] = [image, ...acc[label]]
  //     }
  //     return acc
  //   }, filteredImages)

  //   if (newLabels.size === 0) {
  //     // The image is now unlabeled, remove it from the labeled category.
  //     addedImages.labeled = addedImages.labeled.filter(i => i !== image)
  //     // Add it to the unlabeled category.
  //     addedImages.unlabeled = [...new Set([image, ...addedImages.unlabeled])]
  //   } else {
  //     // The image is now labeled, remove it from the unlabeled category.
  //     addedImages.unlabeled = addedImages.unlabeled.filter(i => i !== image)
  //     // Add it to the labeled category.
  //     addedImages.labeled = [...new Set([image, ...addedImages.labeled])]
  //   }

  //   const cleanedAnnotation = annotation.map(annotation => {
  //     switch (this._type) {
  //       case 'localization':
  //         return {
  //           x: annotation.x,
  //           x2: annotation.x2,
  //           y: annotation.y,
  //           y2: annotation.y2,
  //           label: annotation.label
  //         }
  //       case 'classification':
  //       default:
  //         return { label: annotation.label }
  //     }
  //   })

  //   annotations[image] = cleanedAnnotation

  //   Object.keys(annotations).forEach(key => {
  //     if (annotations[key].length === 0) {
  //       delete annotations[key]
  //     }
  //   })
  //   const collection = new Collection(
  //     this._type,
  //     labels,
  //     addedImages,
  //     annotations
  //   )
  //   collection._bucket = this._bucket
  //   return collection
  // }

  public setType(type: Type, syncComplete: SyncCallback): Collection {
    const collection = produce(this as Collection, draft => {
      draft._type = type
    })
    if (syncComplete) {
      this._syncBucket(collection, syncComplete)
    }
    return collection
  }

  // TODO: Maybe change to `createBBox` `modifyBBox`

  public localSetAnnotation(
    image: string,
    annotation: Annotation[]
  ): Collection {
    return produce(this as Collection, draft => {
      draft._annotations[image] = annotation
    })
  }

  public renameBBox(
    image: string,
    bbox: Annotation,
    newLabel: string
  ): Collection {
    return produce(this as Collection, draft => {
      draft._annotations[image][
        draft._annotations[image].findIndex(
          oldBBox =>
            oldBBox.x === bbox.x &&
            oldBBox.x2 === bbox.x2 &&
            oldBBox.y === bbox.y &&
            oldBBox.y2 === bbox.y2 &&
            oldBBox.label === bbox.label
        )
      ].label = newLabel
    })
  }

  public deleteBBox(image: string, bbox: Annotation): Collection {
    return produce(this as Collection, draft => {
      draft._annotations[image].splice(
        draft._annotations[image].findIndex(
          oldBBox =>
            oldBBox.x === bbox.x &&
            oldBBox.x2 === bbox.x2 &&
            oldBBox.y === bbox.y &&
            oldBBox.y2 === bbox.y2 &&
            oldBBox.label === bbox.label
        ),
        1
      )
    })
  }

  private _syncBucket = (
    collection: Collection,
    syncComplete: SyncCallback
  ) => {
    delete (collection as any).images

    const blob = new Blob([JSON.stringify(collection)], {
      type: 'application/json;charset=utf-8;'
    })
    this._bucket
      .putFile({
        name: '_annotations.json',
        blob: blob
      })
      .then(() => {
        syncComplete()
      })
  }

  toJSON() {
    return {
      version: VERSION,
      type: this._type,
      labels: this._labels,
      annotations: this._annotations
    }
  }
}
