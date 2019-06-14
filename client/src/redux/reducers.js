import { combineReducers } from 'redux'
import bucketsReducer from './buckets'

export default combineReducers({ buckets: bucketsReducer })
