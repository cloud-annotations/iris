import { combineReducers } from 'redux'
import accountsReducer from './accounts'
import resourcesReducer from './resources'
import profileReducer from './profile'
import bucketsReducer from './buckets'
import collectionReducer from './collection'
import editingReducer from './editing'

export default combineReducers({
  accounts: accountsReducer,
  resources: resourcesReducer,
  profile: profileReducer,
  buckets: bucketsReducer,
  collection: collectionReducer,
  editing: editingReducer
})
