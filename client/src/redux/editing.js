// Actions
const SET = 'cloud-annotations/editing/SET'

// Should only ever be editing one image.
// {
//   id: '0.00.00.00.0Untitled Label',
//   image: 'image1.jpg',
//   box: [x: 0.0, y: 0.0, x2: 0.0, y2: 0.0, label: 'Untitled Label']
// }

// Reducer
const defaultEditing = { id: undefined, image: undefined, box: undefined }
export default function reducer(editing = defaultEditing, action = {}) {
  switch (action.type) {
    case SET:
      return { id: action.id, image: action.image, box: action.box }
    default:
      return editing
  }
}

// Action Creators
export const setEditingBox = (image, id, box) => ({
  type: SET,
  image: image,
  id: id,
  box: box
})
