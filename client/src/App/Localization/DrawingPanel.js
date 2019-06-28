import React from 'react'

import Canvas from 'common/Canvas/Canvas'
import CrossHair from 'common/CrossHair/CrossHair'

const DrawingPanel = ({ bboxes, image }) => {
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
        color={'#ff0000'}
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
              // onDrawStarted={this.handleDrawStarted}
              // onCoordinatesChanged={this.handleCoordinatesChanged}
              // onBoxFinished={this.handleBoxFinished}
            />
          </div>
        }
      />
    </div>
  )
}

export default DrawingPanel
