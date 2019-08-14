import React, { useCallback, useState, useEffect } from 'react'
import { connect } from 'react-redux'

import Canvas from 'common/Canvas/Canvas'
import CrossHair from 'common/CrossHair/CrossHair'
import { createBox } from 'redux/collection'
import { setIntermediateBox } from 'redux/intermediate'

const uniqueColor = (index, numberOfColors) => {
  const baseHue = 196
  const spread = 360 / numberOfColors
  const hue = Math.round((index * spread + baseHue) % 360)
  return `hsl(${hue}, 100%, 50%)`
}

const DrawingPanel = ({
  createBox,
  setIntermediateBox,
  annotations,
  selectedImage,
  image,
  hoveredBox
}) => {
  const bboxes = annotations[selectedImage] || []

  const activeLabel = undefined // TODO: get from props

  const handleBoxStarted = useCallback(
    bbox => {
      setIntermediateBox(selectedImage, {
        ...bbox,
        label: activeLabel || 'Untitled Label'
      })
    },
    [activeLabel, selectedImage, setIntermediateBox]
  )

  const handleBoxChanged = useCallback(
    bbox => {
      setIntermediateBox(selectedImage, {
        ...bbox,
        label: activeLabel || 'Untitled Label'
      })
    },
    [activeLabel, selectedImage, setIntermediateBox]
  )

  const handleBoxFinished = useCallback(
    box => {
      setIntermediateBox(selectedImage, undefined)
      createBox(selectedImage, {
        ...box,
        label: activeLabel || 'Untitled Label'
      })
    },
    [activeLabel, createBox, selectedImage, setIntermediateBox]
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
        active={true}
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
              mode={'box'}
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
const mapDispatchToProps = { createBox, setIntermediateBox }
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawingPanel)
