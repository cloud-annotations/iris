import React, { useCallback, useState, useEffect } from 'react'
import { connect } from 'react-redux'

import Canvas from 'common/Canvas/Canvas'
import CrossHair from 'common/CrossHair/CrossHair'
import { createBox } from 'redux/collection'

const uniqueColor = (index, numberOfColors) => {
  const baseHue = 196
  const spread = 360 / numberOfColors
  const hue = Math.round((index * spread + baseHue) % 360)
  return `hsl(${hue}, 100%, 50%)`
}

const DrawingPanel = ({
  createBox,
  annotations,
  selectedImage,
  image,
  hoveredBox
}) => {
  const bboxes = annotations[selectedImage] || []

  const activeLabel = undefined // TODO: get from props

  // const handleDrawStarted = useCallback(
  //   bbox => {
  //     bbox.label = activeLabel || 'Untitled Label'
  //     // dispatch(setBBoxesForImageLocal([bbox, ...bboxes], selectedImage))
  //   },
  //   [activeLabel, bboxes, dispatch, selectedImage]
  // )

  // const handleCoordinatesChanged = useCallback(
  //   bbox => {
  //     createBox(selectedImage, bbox)
  //     // dispatch(
  //     //   setBBoxesForImageLocal(
  //     //     // Non mutating index replace.
  //     //     bboxes.map((b, i) => (i === index ? bbox : b)),
  //     //     selectedImage
  //     //   )
  //     // )
  //   },
  //   [createBox, selectedImage]
  // )

  const handleBoxFinished = useCallback(
    box => {
      createBox(selectedImage, {
        ...box,
        label: activeLabel || 'Untitled Label'
      })
    },
    [activeLabel, createBox, selectedImage]
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
              onBoxFinished={handleBoxFinished}
            />
          </div>
        }
      />
    </div>
  )
}

const mapStateToProps = state => ({ annotations: state.collection.annotations })
const mapDispatchToProps = { createBox }
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawingPanel)
