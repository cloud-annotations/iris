import Collection from 'Collection'
import { endpointForLocationConstraint } from 'endpoints'

// Actions
const SET = 'cloud-annotations/collection/SET'
const SET_TYPE = 'cloud-annotations/collection/SET_TYPE'
const SET_BOXES_LOCAL = 'cloud-annotations/collection/SET_BOXES_LOCAL'
// const SET_BOXES = 'cloud-annotations/collection/SET_BOXES'
const CLEAR = 'cloud-annotations/collection/CLEAR'
const RENAME_BOX = 'cloud-annotations/collection/RENAME_BOX'
const DELETE_BOX = 'cloud-annotations/collection/DELETE_BOX'

// Reducer
export default function reducer(collection = Collection.EMPTY, action = {}) {
  // Using blocks to keep scope clean.
  switch (action.type) {
    case SET:
    case CLEAR: {
      return action.collection
    }
    case SET_TYPE: {
      const newCollection = collection.setType(action.c_type, action.done)
      return newCollection
    }
    case SET_BOXES_LOCAL: {
      // We only sync once the box is finished being drawn.
      const newCollection = collection.localSetAnnotation(
        action.image,
        action.bboxes
      )
      return newCollection
    }
    case RENAME_BOX: {
      const newCollection = collection.renameBBox(
        action.image,
        action.bbox,
        action.newLabel
      )
      return newCollection
    }
    case DELETE_BOX: {
      const newCollection = collection.deleteBBox(action.image, action.bbox)
      return newCollection
    }

    default: {
      return collection
    }
  }
}

// Action Creators
export const setCollection = c => ({ type: SET, collection: c })

export const setCollectionType = (t, d) => ({
  type: SET_TYPE,
  c_type: t,
  done: d
})

export const setBBoxesForImageLocal = (bboxes, image) => ({
  type: SET_BOXES_LOCAL,
  bboxes: bboxes,
  image: image
})

// export const setBBoxesForImage = (bboxes, image, done) => ({
//   type: SET_BOXES,
//   bboxes: bboxes,
//   image: image,
//   done: done
// })

export const renameBBox = (image, bbox, newLabel) => ({
  type: RENAME_BOX,
  image: image,
  bbox: bbox,
  newLabel: newLabel
})

export const deleteBBox = (image, bbox) => ({
  type: DELETE_BOX,
  image: image,
  bbox: bbox
})

export const clearCollection = () => ({
  type: CLEAR,
  collection: Collection.EMPTY
})

// Side Effects
export const loadCollection = async (bucket, location) => {
  console.log(location)
  const endpoint = endpointForLocationConstraint(location)
  console.log(endpoint)
  const collection = await Collection.load(endpoint, bucket)
  return setCollection(collection)
}
