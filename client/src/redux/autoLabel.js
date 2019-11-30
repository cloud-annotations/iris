// Actions
const SET_ACTIVE = 'cloud-annotations/autoLabel/SET_ACTIVE'
const SET_MODEL = 'cloud-annotations/autoLabel/SET_MODEL'
const SET_PREDICTIONS = 'cloud-annotations/autoLabel/SET_PREDICTIONS'
const SET_ACTIVE_PREDICTION =
  'cloud-annotations/autoLabel/SET_ACTIVE_PREDICTION'

// Reducer
const defaultAutoLabeler = {
  model: undefined,
  predictions: [],
  activePrediction: 0
}
export default function reducer(autoLabeler = defaultAutoLabeler, action = {}) {
  switch (action.type) {
    case SET_ACTIVE:
      return {
        ...autoLabeler,
        active: action.active,
        predictions: [],
        activePrediction: 0
      }
    case SET_MODEL:
      return {
        ...autoLabeler,
        model: action.model,
        predictions: [],
        activePrediction: 0
      }
    case SET_PREDICTIONS:
      return {
        ...autoLabeler,
        predictions: action.predictions,
        activePrediction: 0
      }
    case SET_ACTIVE_PREDICTION:
      return { ...autoLabeler, activePrediction: action.activePrediction }
    default:
      return autoLabeler
  }
}

// Action Creators
export const setActive = item => ({ type: SET_ACTIVE, active: item })

export const setModel = item => ({ type: SET_MODEL, model: item })

export const setPredictions = item => ({
  type: SET_PREDICTIONS,
  predictions: item
})

export const setActivePrediction = item => ({
  type: SET_ACTIVE_PREDICTION,
  activePrediction: item
})
