import Collection from 'Collection'
import { endpointForLocationConstraint } from 'endpoints'
import { incrementSaving, decrementSaving } from 'redux/editor'
import socket from 'globalSocket'

// Actions
const SET = 'cloud-annotations/collection/SET'
const SET_TYPE = 'cloud-annotations/collection/SET_TYPE'
const CREATE_LABEL = 'cloud-annotations/collection/CREATE_LABEL'
const DELETE_LABEL = 'cloud-annotations/collection/DELETE_LABEL'
const UPLOAD_IMAGES = 'cloud-annotations/collection/UPLOAD_IMAGES'
const DELETE_IMAGES = 'cloud-annotations/collection/DELETE_IMAGES'
const LABEL_IMAGES = 'cloud-annotations/collection/LABEL_IMAGES'
const LABEL_IMAGES_V2 = 'cloud-annotations/collection/LABEL_IMAGES_V2'
const CLEAR_LABELS = 'cloud-annotations/collection/CLEAR_LABELS'
const CREATE_BOX = 'cloud-annotations/collection/CREATE_BOX'
const DELETE_BOX = 'cloud-annotations/collection/DELETE_BOX'
const ADD_MODEL = 'cloud-annotations/collection/ADD_MODEL'

// Reducer
export default function reducer(collection = Collection.EMPTY, action = {}) {
  switch (action.type) {
    case SET:
      return action.collection
    case SET_TYPE:
      if (collection.sandboxMode) {
        return collection.noOP(...action.params)
      }
      return collection.setType(...action.params)

    case CREATE_LABEL:
      if (collection.sandboxMode) {
        return collection.noOP(...action.params)
      }
      {
        const [label, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '+',
            value: {
              labels: { label: label }
            }
          })
        }
      }
      return collection.createLabel(...action.params)

    case DELETE_LABEL:
      if (collection.sandboxMode) {
        return collection.noOP(...action.params)
      }
      {
        const [label, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '-',
            value: {
              labels: { label: label }
            }
          })
        }
      }
      return collection.deleteLabel(...action.params)

    case UPLOAD_IMAGES:
      {
        const [images, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '+',
            value: {
              images: { images: images }
            }
          })
        }
      }
      return collection.uploadImages(...action.params)

    case DELETE_IMAGES:
      if (collection.sandboxMode) {
        return collection.noOP(...action.params)
      }
      {
        const [images, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '-',
            value: {
              images: { images: images }
            }
          })
        }
      }
      return collection.deleteImages(...action.params)

    case LABEL_IMAGES:
      {
        const [images, label, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '+',
            value: {
              bulkLabel: { images: images, label: label }
            }
          })
        }
      }
      return collection.labelImages(...action.params)

    case LABEL_IMAGES_V2:
      {
        const [images, label, onlyOne, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '',
            value: {
              bulkLabelV2: { images: images, label: label, onlyOne: onlyOne }
            }
          })
        }
      }
      return collection.labelImagesV2(...action.params)

    case CLEAR_LABELS:
      {
        const [images, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '',
            value: {
              clearAllLabels: { images: images }
            }
          })
        }
      }
      return collection.clearLabels(...action.params)

    case CREATE_BOX:
      {
        const [image, box, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '+',
            value: {
              annotations: { image: image, box: box }
            }
          })
        }
      }
      return collection.createBox(...action.params)

    case DELETE_BOX:
      {
        const [image, box, onComplete] = action.params
        if (onComplete) {
          socket.emit('patch', {
            op: '-',
            value: {
              annotations: { image: image, box: box }
            }
          })
        }
      }
      return collection.deleteBox(...action.params)

    case ADD_MODEL:
      if (collection.sandboxMode) {
        return collection.noOP(...action.params)
      }
      return collection.addModel(action.model)

    default:
      return collection
  }
}

// Action Creators
export const setCollection = c => ({ type: SET, collection: c })
export const clearCollection = () => setCollection(Collection.EMPTY)

export const setCollectionType = (type, onComplete) => ({
  type: SET_TYPE,
  params: [type, onComplete]
})

export const createLabel = (label, onComplete) => ({
  type: CREATE_LABEL,
  params: [label, onComplete]
})

export const deleteLabel = (label, onComplete) => ({
  type: DELETE_LABEL,
  params: [label, onComplete]
})

export const uploadImages = (images, onComplete) => ({
  type: UPLOAD_IMAGES,
  params: [images, onComplete]
})

export const deleteImages = (images, onComplete) => ({
  type: DELETE_IMAGES,
  params: [images, onComplete]
})

export const labelImages = (images, label, onComplete) => ({
  type: LABEL_IMAGES,
  params: [images, label, onComplete]
})

export const labelImagesV2 = (images, label, onlyOne, onComplete) => ({
  type: LABEL_IMAGES_V2,
  params: [images, label, onlyOne, onComplete]
})

export const clearLabels = (images, onComplete) => ({
  type: CLEAR_LABELS,
  params: [images, onComplete]
})

export const createBox = (image, box, onComplete) => ({
  type: CREATE_BOX,
  params: [image, box, onComplete]
})

export const deleteBox = (image, box, onComplete) => ({
  type: DELETE_BOX,
  params: [image, box, onComplete]
})

export const addModel = model => ({
  type: ADD_MODEL,
  model: model
})

// Side Effects
export const loadCollection = async (bucket, location) => {
  const endpoint = endpointForLocationConstraint(location)
  return await Collection.load(endpoint, bucket)
}

// Thunk
export const syncAction = (action, args) => {
  return dispatch => {
    const onComplete = () => {
      dispatch(decrementSaving())
    }
    dispatch(action(...args, onComplete))
    dispatch(incrementSaving())
  }
}
