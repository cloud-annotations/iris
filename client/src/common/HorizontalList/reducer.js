export default (state, action) => {
  switch (action.type) {
    case 'SET_SELECTION':
      return {
        ...state,
        selection: action.value
      }
    default:
      return state
  }
}
