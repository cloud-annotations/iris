import { BOX } from 'common/Canvas/Canvas'

// Actions
const SET_ACTIVE_BOX = 'cloud-annotations/editor/SET_ACTIVE_BOX'
const SET_ACTIVE_IMAGE = 'cloud-annotations/editor/SET_ACTIVE_IMAGE'
const SET_ACTIVE_TOOL = 'cloud-annotations/editor/SET_ACTIVE_TOOL'
const SET_ACTIVE_LABEL = 'cloud-annotations/editor/SET_ACTIVE_LABEL'
const SET_HOVERED_BOX = 'cloud-annotations/editor/SET_HOVERED_BOX'
const RESET_EDITOR = 'cloud-annotations/editor/RESET_EDITOR'
const INCREMENT_SAVING = 'cloud-annotations/editor/INCREMENT_SAVING'
const DECREMENT_SAVING = 'cloud-annotations/editor/DECREMENT_SAVING'

// Reducer
const defaultEditor = {
  saving: 0,
  box: undefined,
  image: undefined,
  tool: BOX,
  label: undefined,
  hoveredBox: undefined
}
export default function reducer(editor = defaultEditor, action = {}) {
  switch (action.type) {
    case RESET_EDITOR:
      return defaultEditor
    case INCREMENT_SAVING:
      return { ...editor, saving: editor.saving + 1 }
    case DECREMENT_SAVING:
      return { ...editor, saving: editor.saving - 1 }
    case SET_ACTIVE_BOX:
      return { ...editor, box: action.box }
    case SET_ACTIVE_IMAGE:
      return { ...editor, image: action.image }
    case SET_ACTIVE_TOOL:
      return { ...editor, tool: action.tool }
    case SET_ACTIVE_LABEL:
      return { ...editor, label: action.label }
    case SET_HOVERED_BOX:
      return { ...editor, hoveredBox: action.hoveredBox }
    default:
      return editor
  }
}

// Action Creators
export const reset = () => ({
  type: RESET_EDITOR
})

export const setActiveBox = box => ({
  type: SET_ACTIVE_BOX,
  box: box
})

export const setActiveImage = image => ({
  type: SET_ACTIVE_IMAGE,
  image: image
})

export const setActiveTool = tool => ({
  type: SET_ACTIVE_TOOL,
  tool: tool
})

export const setActiveLabel = label => ({
  type: SET_ACTIVE_LABEL,
  label: label
})

export const setHoveredBox = hoveredBox => ({
  type: SET_HOVERED_BOX,
  hoveredBox: hoveredBox
})

export const incrementSaving = () => ({
  type: INCREMENT_SAVING
})

export const decrementSaving = () => ({
  type: DECREMENT_SAVING
})
