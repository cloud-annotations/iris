// Actions
const SET = 'cloud-annotations/profile/SET'

// Reducer
export default function reducer(profile = {}, action = {}) {
  switch (action.type) {
    case SET:
      return action.profile
    default:
      return profile
  }
}

// Action Creators
export const setProfile = p => ({ type: SET, profile: p })
