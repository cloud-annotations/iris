// Actions
const SET = 'cloud-annotations/wmlResources/SET'
const SET_ACTIVE = 'cloud-annotations/wmlResources/SET_ACTIVE'
const SET_LOADING = 'cloud-annotations/wmlResources/SET_LOADING'
const INVALIDATE = 'cloud-annotations/wmlResources/INVALIDATE'

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
        const savedResource = localStorage.getItem('activeWMLResource')
        if (action.resources.find(r => r.id === savedResource)) {
          activeResource = savedResource
        }
      }
      if (!activeResource) {
        const [firstResource] = action.resources
        if (firstResource) {
          activeResource = firstResource.id
        }
      }

      return {
        ...resources,
        resources: action.resources,
        activeResource: activeResource
      }
    case SET_ACTIVE:
      localStorage.setItem('activeWMLResource', action.resource)
      return { ...resources, activeResource: action.resource }
    case SET_LOADING:
      return { ...resources, loading: action.loading }
    case INVALIDATE:
      return defaultResources
    default:
      return resources
  }
}

// Action Creators
export const setWMLResources = r => ({ type: SET, resources: r })

export const setActiveWMLResource = r => ({ type: SET_ACTIVE, resource: r })

export const setLoadingWMLResources = l => ({ type: SET_LOADING, loading: l })

export const invalidateWMLResources = () => ({ type: INVALIDATE })
