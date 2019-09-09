import { BOX } from 'common/Canvas/Canvas'
import socket from 'globalSocket'
import history from 'globalHistory'

// Actions
const SET_ACTIVE_BOX = 'cloud-annotations/editor/SET_ACTIVE_BOX'
const SET_ACTIVE_IMAGE = 'cloud-annotations/editor/SET_ACTIVE_IMAGE'
const CLEAR_RANGE = 'cloud-annotations/editor/CLEAR_RANGE'
const CTRL_EXPAND_RANGE = 'cloud-annotations/editor/CTRL_EXPAND_RANGE'
const SHIFT_EXPAND_RANGE = 'cloud-annotations/editor/SHIFT_EXPAND_RANGE'
const SET_ACTIVE_TOOL = 'cloud-annotations/editor/SET_ACTIVE_TOOL'
const SET_ACTIVE_LABEL = 'cloud-annotations/editor/SET_ACTIVE_LABEL'
const SET_HOVERED_BOX = 'cloud-annotations/editor/SET_HOVERED_BOX'
const RESET_EDITOR = 'cloud-annotations/editor/RESET_EDITOR'
const INCREMENT_SAVING = 'cloud-annotations/editor/INCREMENT_SAVING'
const DECREMENT_SAVING = 'cloud-annotations/editor/DECREMENT_SAVING'
const UPDATE_HEAD_COUNT = 'cloud-annotations/editor/UPDATE_HEAD_COUNT'

// Reducer
const defaultEditor = {
  saving: 0,
  box: undefined,
  image: undefined,
  range: [],
  tool: BOX,
  label: undefined,
  hoveredBox: undefined,
  headCount: 0
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
      const bucket = history.location.pathname.split('/')[1]
      socket.emit('join', { bucket: bucket, image: action.image })
      return { ...editor, image: action.image, range: [action.image] }
    case CTRL_EXPAND_RANGE:
      const rangeHasImage = editor.range.includes(action.image)

      // Add or remove the new image.
      const newRange = rangeHasImage
        ? editor.range.filter(i => i !== action.image)
        : [action.image, ...editor.range]

      // TODO: This is pure filth.
      let newActiveImage
      if (rangeHasImage) {
        if (editor.image === action.image) {
          if (newRange.length === 0) {
            newActiveImage = editor.image
            newRange.push(editor.image)
          } else {
            newActiveImage = newRange[0]
          }
        } else {
          newActiveImage = editor.image
        }
      } else {
        newActiveImage = action.image
      }

      return {
        ...editor,
        image: newActiveImage,
        range: newRange
      }
    case SHIFT_EXPAND_RANGE:
      return { ...editor, range: [] }
    case SET_ACTIVE_TOOL:
      return { ...editor, tool: action.tool }
    case SET_ACTIVE_LABEL:
      return { ...editor, label: action.label }
    case SET_HOVERED_BOX:
      return { ...editor, hoveredBox: action.hoveredBox }
    case UPDATE_HEAD_COUNT:
      return { ...editor, headCount: action.count }
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

export const clearRange = () => ({
  type: CLEAR_RANGE
})

export const ctlExpandRange = image => ({
  type: CTRL_EXPAND_RANGE,
  image: image
})

export const shiftExpandRange = index => ({
  type: SHIFT_EXPAND_RANGE,
  index: index
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

export const updateHeadCount = count => ({
  type: UPDATE_HEAD_COUNT,
  count: count
})
