import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'

import Canvas, { BOX, MOVE } from 'common/Canvas/Canvas'
import CrossHair from 'common/CrossHair/CrossHair'
import { createBox, deleteBox, createLabel } from 'redux/collection'
import { setActiveBox, setActiveLabel } from 'redux/editor'
import { uniqueColor } from './color-utils'

const useIsControlPressed = () => {
  const [isPressed, setIsPressed] = useState(false)
  const handleKeyDown = useCallback(e => {
    if (document.activeElement.tagName.toLowerCase() === 'input') {
      setIsPressed(false)
    }

    if (e.ctrlKey || e.metaKey) {
      setIsPressed(true)
    }
  }, [])

  const handleKeyUp = useCallback(e => {
    setIsPressed(false)
    if (e.ctrlKey || e.metaKey) {
      setIsPressed(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return isPressed
}

const DrawingPanel = ({
  createBox,
  deleteBox,
  createLabel,
  setActiveLabel,
  setActiveBox,
  annotations,
  selectedImage,
  image,
  tool,
  labels,
  activeLabel,
  activeBox,
  hoveredBox
}) => {
  const bboxes = annotations[selectedImage] || []

  const isControlPressed = useIsControlPressed()

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
        createLabel(box.label)
        setActiveLabel(box.label)
      }
      const boxToUpdate = bboxes.find(b => b.id === box.id)
      if (boxToUpdate) {
        deleteBox(selectedImage, boxToUpdate)
        createBox(selectedImage, box)
      } else {
        createBox(selectedImage, box)
      }
      setActiveBox(undefined)
    },
    [
      labels,
      bboxes,
      setActiveBox,
      createLabel,
      setActiveLabel,
      deleteBox,
      selectedImage,
      createBox
    ]
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

  const activeTool = isControlPressed ? MOVE : tool

  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        border: '1px solid var(--border)'
      }}
    >
      <CrossHair
        color={activeColor}
        active={activeTool === BOX}
        children={
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Canvas
              mode={activeTool}
              activeLabel={activeLabel || 'Untitled Label'}
              cmap={cmap}
              bboxes={mergedBoxes}
              image={image}
              hovered={hoveredBox}
              onBoxStarted={handleBoxStarted}
              onBoxChanged={handleBoxChanged}
              onBoxFinished={handleBoxFinished}
            />
          </div>
        }
      />
    </div>
  )
}

const mapStateToProps = state => ({
  annotations: state.collection.annotations,
  labels: state.collection.labels,
  activeBox: state.editor.box,
  activeLabel: state.editor.label,
  hoveredBox: state.editor.hoveredBox,
  tool: state.editor.tool
})
const mapDispatchToProps = {
  createBox,
  deleteBox,
  setActiveBox,
  createLabel,
  setActiveLabel
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawingPanel)
