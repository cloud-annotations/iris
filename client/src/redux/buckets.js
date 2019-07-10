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
export const loadBuckets = async instanceId => {
  const endpoint = 's3.us-west.cloud-object-storage.test.appdomain.cloud'
  const cos = new COS({ endpoint: endpoint })
  const res = await cos.listBuckets({
    IBMServiceInstanceId: instanceId
  })

  let buckets = res.ListAllMyBucketsResult.Buckets
  if (!Array.isArray(buckets)) {
    buckets = [buckets.Bucket]
  }

  buckets = buckets.map(bucket => ({
    id: bucket.Name,
    name: bucket.Name,
    created: new Date(bucket.CreationDate).toLocaleDateString()
  }))

  console.log(buckets)
  return setBuckets(buckets)
}
