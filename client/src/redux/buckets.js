import COS from 'api/COS'

// Actions
const SET = 'cloud-annotations/buckets/SET'

// Reducer
export default function reducer(buckets = null, action = {}) {
  switch (action.type) {
    case SET:
      return action.buckets
    default:
      return buckets
  }
}

// Action Creators
export const setBuckets = b => ({ type: SET, buckets: b })

// Side Effects
export const loadBuckets = async () => {
  const endpoint = localStorage.getItem('loginUrl')
  const instanceId = localStorage.getItem('resourceId')
  const buckets = await new COS(endpoint).buckets(instanceId)
  return setBuckets(buckets)
}
