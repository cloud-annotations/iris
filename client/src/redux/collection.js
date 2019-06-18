import Collection from 'Collection'

// Actions
const SET = 'cloud-annotations/collection/SET'
const CLEAR = 'cloud-annotations/collection/CLEAR'

// Reducer
export default function reducer(collection = Collection.EMPTY, action = {}) {
  switch (action.type) {
    case SET:
    case CLEAR:
      return action.collection
    default:
      return collection
  }
}

// Action Creators
export const setCollection = c => ({ type: SET, collection: c })
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
