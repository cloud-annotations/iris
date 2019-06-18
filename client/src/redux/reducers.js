import { combineReducers } from 'redux'
import bucketsReducer from './buckets'
import collectionReducer from './collection'

export default combineReducers({
  buckets: bucketsReducer,
  collection: collectionReducer
})
