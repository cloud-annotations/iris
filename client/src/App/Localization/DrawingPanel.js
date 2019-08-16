import React, { useCallback } from 'react'
import { connect } from 'react-redux'

import Canvas from 'common/Canvas/Canvas'
import CrossHair from 'common/CrossHair/CrossHair'
import { createBox, deleteBox } from 'redux/collection'
import { setActiveBox } from 'redux/editor'

const uniqueColor = (index, numberOfColors) => {
  const baseHue = 196
  const spread = 360 / numberOfColors
  const hue = Math.round((index * spread + baseHue) % 360)
  return `hsl(${hue}, 100%, 50%)`
}

const DrawingPanel = ({
  createBox,
  deleteBox,
  setActiveBox,
  annotations,
  selectedImage,
  image,
  tool,
  activeLabel,
  activeBox,
  hoveredBox
}) => {
  const bboxes = annotations[selectedImage] || []

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
      const boxToUpdate = bboxes.find(b => b.id === box.id)
      if (boxToUpdate) {
        deleteBox(selectedImage, boxToUpdate)
        createBox(selectedImage, box)
      } else {
        createBox(selectedImage, box)
      }
      setActiveBox(undefined)
    },
    [bboxes, setActiveBox, createBox, selectedImage, deleteBox]
  )

  let mergedBoxes = [...bboxes]
  if (activeBox) {
    mergedBoxes = mergedBoxes.filter(box => box.id !== activeBox.id)
    mergedBoxes.unshift(activeBox)
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
              activeLabel={activeLabel || 'Untitled Label'} // TODO: We need to create the untitled label...
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
  activeBox: state.editor.box,
  activeLabel: state.editor.label,
  hoveredBox: state.editor.hoveredBox,
  tool: state.editor.tool
})
const mapDispatchToProps = { createBox, deleteBox, setActiveBox }
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawingPanel)
