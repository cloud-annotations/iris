// Actions
const SET = 'cloud-annotations/resources/SET'
const SET_LOADING = 'cloud-annotations/resources/SET_LOADING'

// Reducer
const defaultResources = {
  loading: true,
  resources: [],
  activeResource: null
}

export default function reducer(resources = defaultResources, action = {}) {
  switch (action.type) {
    case SET:
      return action.resources
    case SET_LOADING:
      return { ...resources, loading: action.loading }
    default:
      return resources
  }
}

// Action Creators
export const setResources = r => ({ type: SET, resources: r })

export const setLoading = l => ({ type: SET_LOADING, loading: l })
