// Actions
const SET = 'cloud-annotations/resources/SET'
const SET_ACTIVE = 'cloud-annotations/resources/SET_ACTIVE'
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
      let { activeResource } = resources

      // If the current active resource no longer exists, remove it.
      if (!action.resources.find(r => r.id === activeResource)) {
        activeResource = null
      }

      if (!activeResource) {
        // Check saved resource exists.
        const savedResource = localStorage.getItem('activeResource')
        if (action.resources.find(r => r.id === savedResource)) {
          activeResource = savedResource
        }
      }
      if (!activeResource) {
        const [firstResource] = action.resources
        activeResource = firstResource.id
      }

      return { resources: action.resources, activeResource: activeResource }
    case SET_ACTIVE:
      localStorage.setItem('activeResource', action.resource)
      return { ...resources, activeResource: action.resource }
    case SET_LOADING:
      return { ...resources, loading: action.loading }
    default:
      return resources
  }
}

// Action Creators
export const setResources = r => ({ type: SET, resources: r })

export const setActiveResource = r => ({ type: SET_ACTIVE, resource: r })

export const setLoadingResources = l => ({ type: SET_LOADING, loading: l })
