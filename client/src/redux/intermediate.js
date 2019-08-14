// Actions
const SET = 'cloud-annotations/intermediate/SET'

// Reducer
export default function reducer(annotations = {}, action = {}) {
  switch (action.type) {
    case SET:
      return { ...annotations, [action.image]: action.box }
    default:
      return annotations
  }
}

// Action Creators
export const setIntermediateBox = (image, box) => ({
  type: SET,
  image: image,
  box: box
})
