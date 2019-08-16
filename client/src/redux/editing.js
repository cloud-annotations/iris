// Actions
const SET = 'cloud-annotations/editing/SET'

// Reducer
export default function reducer(editing = {}, action = {}) {
  switch (action.type) {
    case SET:
      return { box: action.box }
    default:
      return editing
  }
}

// Action Creators
export const setEditingBox = box => ({
  type: SET,
  box: box
})
