import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'

import Canvas, { BOX, MOVE, AUTO_LABEL } from 'common/Canvas/Canvas'
import EmptySet from 'common/EmptySet/EmptySet'
import CrossHair from 'common/CrossHair/CrossHair'
import { createBox, deleteBox, createLabel, syncAction } from 'redux/collection'
import { setActiveBox, setActiveLabel, setActiveTool } from 'redux/editor'
import { setPredictions } from 'redux/autoLabel'
import { uniqueColor } from './color-utils'

import styles from './DrawingPanel.module.css'

const useIsControlPressed = onCtrlChange => {
  const [isPressed, setIsPressed] = useState(false)
  const handleKeyDown = useCallback(
    e => {
      if (document.activeElement.tagName.toLowerCase() === 'input') {
        setIsPressed(false)
        onCtrlChange(false)
        return
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        setIsPressed(true)
        onCtrlChange(true)
        return
      }

      setIsPressed(false)
      onCtrlChange(false)
    },
    [onCtrlChange]
  )

  const handleKeyUp = useCallback(
    e => {
      setIsPressed(false)
      onCtrlChange(false)
    },
    [onCtrlChange]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    document.addEventListener('msvisibilitychange', handleKeyUp)
    document.addEventListener('webkitvisibilitychange', handleKeyUp)
    document.addEventListener('visibilitychange', handleKeyUp)
    window.addEventListener('blur', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)

      document.removeEventListener('msvisibilitychange', handleKeyUp)
      document.removeEventListener('webkitvisibilitychange', handleKeyUp)
      document.removeEventListener('visibilitychange', handleKeyUp)
      window.removeEventListener('blur', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return isPressed
}

const useToggleLabel = (activeLabel, labels, setActiveLabel) => {
  const handleKeyDown = useCallback(
    e => {
      if (document.activeElement.tagName.toLowerCase() === 'input') {
        return
      }

      const char = e.key.toLowerCase()
      if (char === 'q') {
        setActiveLabel(
          labels[(labels.indexOf(activeLabel) + 1) % labels.length]
        )
      }
      let labelIndex = parseInt(char) - 1
      // Treat 0 as 10 because it comes after 9 on the keyboard.
      if (labelIndex < 0) {
        labelIndex = 9
      }
      if (labelIndex < labels.length) {
        setActiveLabel(labels[labelIndex])
      }
    },
    [activeLabel, labels, setActiveLabel]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

const partition = (array, isValid) =>
  array.reduce(
    ([pass, fail], item) => {
      return isValid(item) ? [[...pass, item], fail] : [pass, [...fail, item]]
    },
    [[], []]
  )

const DrawingPanel = ({
  setActiveLabel,
  setActiveBox,
  setActiveTool,
  syncAction,
  annotations,
  selectedImage,
  image,
  tool,
  labels,
  activeLabel,
  activeBox,
  hoveredBox,
  headCount,
  model,
  autoLabelActive,
  predictions,
  setPredictions,
  activePrediction
}) => {
  if (autoLabelActive) {
    tool = AUTO_LABEL
  }

  //////////////////////////////////
  useEffect(() => {
    if (autoLabelActive && model && image) {
      const img = new Image()
      img.onload = () => {
        model.detect(img).then(predictions => {
          const scaledPredictions = predictions.map(prediction => {
            prediction.bbox[0] /= img.width
            prediction.bbox[1] /= img.height
            prediction.bbox[2] /= img.width
            prediction.bbox[3] /= img.height
            return prediction
          })
          setPredictions(scaledPredictions)
        })
      }
      img.src = image
    }
  }, [autoLabelActive, image, model, setPredictions])
  //////////////////////////////////

  const rawAnnotationsForImage = annotations[selectedImage] || []

  const [bboxes, onlyLabels] = partition(
    rawAnnotationsForImage,
    box =>
      box.x !== undefined &&
      box.y !== undefined &&
      box.x2 !== undefined &&
      box.y2 !== undefined
  )

  const handleControlChange = useCallback(
    isPressed => {
      setActiveTool(isPressed ? MOVE : BOX)
    },
    [setActiveTool]
  )

  useIsControlPressed(handleControlChange)
  useToggleLabel(activeLabel, labels, setActiveLabel)

  const handleBoxStarted = useCallback(
    box => {
      setActiveBox(box)
    },
    [setActiveBox]
  )

  const handleBoxChanged = useCallback(
    box => {
      setActiveBox(box)
    },
    [setActiveBox]
  )

  const handleBoxFinished = useCallback(
    box => {
      // If the active label doesn't exit, create it. We shouldn't have to trim
      // it, because it shouldn't be anything other than `Untitled Label`.
      if (!labels.includes(box.label)) {
        syncAction(createLabel, [box.label])
        setActiveLabel(box.label)
      }
      const boxToUpdate = bboxes.find(b => b.id === box.id)
      if (boxToUpdate) {
        syncAction(deleteBox, [selectedImage, boxToUpdate])
        syncAction(createBox, [selectedImage, box])
      } else {
        syncAction(createBox, [selectedImage, box])
      }
      setActiveBox(undefined)
    },
    [labels, bboxes, setActiveBox, syncAction, setActiveLabel, selectedImage]
  )

  const handleDeleteLabel = useCallback(
    label => () => {
      syncAction(deleteBox, [selectedImage, { label: label }])
    },
    [syncAction, selectedImage]
  )

  let mergedBoxes = [...bboxes]
  if (activeBox) {
    mergedBoxes = mergedBoxes.filter(box => box.id !== activeBox.id)
    mergedBoxes.unshift(activeBox)
  }

  const cmap = labels.reduce((acc, label, i) => {
    acc[label] = uniqueColor(i, labels.length)
    return acc
  }, {})

  const activeColor = cmap[activeLabel] || 'white'

  // const activeTool = isControlPressed ? MOVE : tool

  const maxBubbles = 3
  const othersCount = Math.max(headCount - 1, 0)
  const clippedCount = Math.min(othersCount, maxBubbles)
  const overflowCount = othersCount - maxBubbles

  return (
    <div className={styles.wrapper}>
      <div className={styles.roomHolder}>
        <div className={styles.labelHolder}>
          {onlyLabels.map(box => (
            <div className={styles.label}>
              {box.label}
              <svg
                height="12px"
                width="12px"
                viewBox="2 2 36 36"
                className={styles.deleteIcon}
                onClick={handleDeleteLabel(box.label)}
              >
                <g>
                  <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
                </g>
              </svg>
            </div>
          ))}
        </div>
        {[...new Array(clippedCount)].map(() => (
          <div className={styles.chatHead}>
            <div>
              <svg
                className={styles.chatHeadIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="2 2 28 28"
              >
                <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 5a4.5 4.5 0 1 1-4.5 4.5A4.49 4.49 0 0 1 16 7zm8 17.92a11.93 11.93 0 0 1-16 0v-.58A5.2 5.2 0 0 1 13 19h6a5.21 5.21 0 0 1 5 5.31v.61z"></path>
              </svg>
            </div>
          </div>
        ))}
        {overflowCount > 0 && (
          <div className={styles.chatHeadOverflow}>
            <div>+{overflowCount}</div>
          </div>
        )}
      </div>
      {selectedImage ? (
        <CrossHair
          color={activeColor}
          active={tool === BOX}
          children={
            <div className={styles.canvasWrapper}>
              <Canvas
                mode={tool}
                activeLabel={activeLabel}
                cmap={cmap}
                bboxes={mergedBoxes}
                image={image}
                hovered={hoveredBox}
                onBoxStarted={handleBoxStarted}
                onBoxChanged={handleBoxChanged}
                onBoxFinished={handleBoxFinished}
                predictions={predictions}
                activePrediction={activePrediction}
                // autoLabelActive={autoLabelActive}
              />
            </div>
          }
        />
      ) : (
        <EmptySet show />
      )}
    </div>
  )
}

const mapStateToProps = state => ({
  annotations: state.collection.annotations,
  labels: state.collection.labels,
  activeBox: state.editor.box,
  activeLabel: state.editor.label,
  hoveredBox: state.editor.hoveredBox,
  tool: state.editor.tool,
  headCount: state.editor.headCount,
  model: state.autoLabel.model,
  autoLabelActive: state.autoLabel.active,
  predictions: state.autoLabel.predictions,
  activePrediction: state.autoLabel.activePrediction
})
const mapDispatchToProps = {
  syncAction,
  setActiveBox,
  setActiveLabel,
  setActiveTool,
  setPredictions
}
export default connect(mapStateToProps, mapDispatchToProps)(DrawingPanel)
