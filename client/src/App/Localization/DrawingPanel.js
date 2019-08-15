import React, { useCallback, useState, useEffect } from 'react'
import { connect } from 'react-redux'

import Canvas, { idForBox } from 'common/Canvas/Canvas'
import CrossHair from 'common/CrossHair/CrossHair'
import { createBox, deleteBox } from 'redux/collection'
import { setEditingBox } from 'redux/editing'

const uniqueColor = (index, numberOfColors) => {
  const baseHue = 196
  const spread = 360 / numberOfColors
  const hue = Math.round((index * spread + baseHue) % 360)
  return `hsl(${hue}, 100%, 50%)`
}

const DrawingPanel = ({
  createBox,
  deleteBox,
  setEditingBox,
  tool,
  annotations,
  selectedImage,
  image,
  hoveredBox
}) => {
  const bboxes = annotations[selectedImage] || []

  const activeLabel = undefined // TODO: get from props

  const handleBoxStarted = useCallback(
    box => {
      const editingBox = {
        ...box,
        label: box.label || activeLabel || 'Untitled Label'
      }
      setEditingBox(selectedImage, idForBox(editingBox), editingBox)
    },
    [activeLabel, selectedImage, setEditingBox]
  )

  const handleBoxChanged = useCallback(
    (id, box) => {
      const editingBox = {
        ...box,
        label: box.label || activeLabel || 'Untitled Label'
      }
      setEditingBox(selectedImage, id, editingBox)
    },
    [activeLabel, selectedImage, setEditingBox]
  )

  const handleBoxFinished = useCallback(
    (id, box) => {
      setEditingBox(undefined, undefined, undefined)
      createBox(selectedImage, {
        ...box,
        label: box.label || activeLabel || 'Untitled Label'
      })
      if (id) {
        const box = bboxes.find(box => idForBox(box) === id)
        deleteBox(selectedImage, box)
      }
    },
    [activeLabel, bboxes, createBox, deleteBox, selectedImage, setEditingBox]
  )

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
              bboxes={bboxes}
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

const mapStateToProps = state => ({ annotations: state.collection.annotations })
const mapDispatchToProps = { createBox, deleteBox, setEditingBox }
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawingPanel)
