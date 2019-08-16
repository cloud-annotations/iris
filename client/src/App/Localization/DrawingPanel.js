import React, { useCallback } from 'react'
import { connect } from 'react-redux'

import Canvas from 'common/Canvas/Canvas'
import CrossHair from 'common/CrossHair/CrossHair'
import { createBox, updateBox } from 'redux/collection'
import { setEditingBox } from 'redux/editing'

const uniqueColor = (index, numberOfColors) => {
  const baseHue = 196
  const spread = 360 / numberOfColors
  const hue = Math.round((index * spread + baseHue) % 360)
  return `hsl(${hue}, 100%, 50%)`
}

const DrawingPanel = ({
  createBox,
  updateBox,
  setEditingBox,
  tool,
  annotations,
  selectedImage,
  image,
  editing,
  hoveredBox
}) => {
  const bboxes = annotations[selectedImage] || []

  const activeLabel = undefined || 'Untitled Label' // TODO: get from props

  const handleBoxStarted = useCallback(
    box => {
      setEditingBox(box)
    },
    [setEditingBox]
  )

  const handleBoxChanged = useCallback(
    box => {
      setEditingBox(box)
    },
    [setEditingBox]
  )

  const handleBoxFinished = useCallback(
    box => {
      const boxToUpdate = bboxes.find(b => b.id === box.id)
      if (boxToUpdate) {
        updateBox(selectedImage, boxToUpdate, box)
      } else {
        createBox(selectedImage, box)
      }
      setEditingBox(undefined)
    },
    [bboxes, createBox, updateBox, selectedImage, setEditingBox]
  )

  let mergedBoxes = [...bboxes]
  if (editing.box) {
    mergedBoxes = mergedBoxes.filter(box => box.id !== editing.box.id)
    mergedBoxes.unshift(editing.box)
  }

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
        color={uniqueColor(7, 10)}
        active={tool === 'box'}
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
              mode={tool}
              activeLabel={activeLabel}
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
  editing: state.editing
})
const mapDispatchToProps = { createBox, updateBox, setEditingBox }
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawingPanel)
