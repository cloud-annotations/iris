import Collection from 'Collection'
import { endpointForLocationConstraint } from 'endpoints'

// Actions
const SET = 'cloud-annotations/collection/SET'

const SET_TYPE = 'cloud-annotations/collection/SET_TYPE'
const CREATE_LABEL = 'cloud-annotations/collection/CREATE_LABEL'
const DELETE_LABEL = 'cloud-annotations/collection/DELETE_LABEL'
const UPLOAD_IMAGES = 'cloud-annotations/collection/UPLOAD_IMAGES'
const DELETE_IMAGES = 'cloud-annotations/collection/DELETE_IMAGES'
const CREATE_BOX = 'cloud-annotations/collection/CREATE_BOX'
const DELETE_BOX = 'cloud-annotations/collection/DELETE_BOX'

// Reducer
export default function reducer(collection = Collection.EMPTY, action = {}) {
  switch (action.type) {
    case SET:
      return action.collection
    case SET_TYPE:
      return collection.setType(...action.params)
    case CREATE_LABEL:
      return collection.createLabel(...action.params)
    case DELETE_LABEL:
      return collection.deleteLabel(...action.params)
    case UPLOAD_IMAGES:
      return collection.uploadImages(...action.params)
    case DELETE_IMAGES:
      return collection.deleteImages(...action.params)
    case CREATE_BOX:
      return collection.createBox(...action.params)
    case DELETE_BOX:
      return collection.deleteBox(...action.params)
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

export const createLabel = label => ({
  type: CREATE_LABEL,
  params: [label]
})

export const deleteLabel = label => ({
  type: DELETE_LABEL,
  params: [label]
})

export const uploadImages = images => ({
  type: UPLOAD_IMAGES,
  params: [images]
})

export const deleteImages = images => ({
  type: DELETE_IMAGES,
  params: [images]
})

export const createBox = (image, box) => ({
  type: CREATE_BOX,
  params: [image, box]
})

export const deleteBox = (image, box) => ({
  type: DELETE_BOX,
  params: [image, box]
})

// Side Effects
export const loadCollection = async (bucket, location) => {
  const endpoint = endpointForLocationConstraint(location)
  return await Collection.load(endpoint, bucket)
}
