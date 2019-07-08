import OldCOS from 'api/COS'
import COS from 'api/COSv2'

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
  const endpoint = localStorage.getItem('endpoint')
  const instanceId = localStorage.getItem('resourceId')
  const cos = new COS({ endpoint: endpoint })
  const buckets = await cos.listBuckets({
    IBMServiceInstanceId: instanceId
  })
  console.log(buckets)
  return setBuckets(buckets)
}
