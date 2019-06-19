import Collection from 'Collection'

// Actions
const SET = 'cloud-annotations/collection/SET'
const SET_TYPE = 'cloud-annotations/collection/SET_TYPE'
const CLEAR = 'cloud-annotations/collection/CLEAR'

// Reducer
export default function reducer(collection = Collection.EMPTY, action = {}) {
  switch (action.type) {
    case SET:
    case CLEAR:
      return action.collection
    case SET_TYPE:
      const newCollection = collection.setType(action.c_type, action.done)
      return newCollection
    default:
      return collection
  }
}

// Action Creators
export const setCollection = c => ({ type: SET, collection: c })
export const setCollectionType = (t, d) => ({
  type: SET_TYPE,
  c_type: t,
  done: d
})
export const clearCollection = () => ({
  type: CLEAR,
  collection: Collection.EMPTY
})

// Side Effects
export const loadCollection = async bucket => {
  const endpoint = localStorage.getItem('loginUrl')
  const collection = await Collection.load(endpoint, bucket)
  return setCollection(collection)
}
