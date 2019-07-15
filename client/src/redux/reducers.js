import { combineReducers } from 'redux'
import profileReducer from './profile'
import bucketsReducer from './buckets'
import collectionReducer from './collection'

export default combineReducers({
  profile: profileReducer,
  buckets: bucketsReducer,
  collection: collectionReducer
})
