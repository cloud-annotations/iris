// Actions
const SET = 'cloud-annotations/resources/SET'

// Reducer
const defaultResources = {
  resources: [],
  activeResource: null
}

export default function reducer(resources = defaultResources, action = {}) {
  switch (action.type) {
    case SET:
      return action.resources
    default:
      return resources
  }
}

// Action Creators
export const setResources = r => ({ type: SET, resources: r })
