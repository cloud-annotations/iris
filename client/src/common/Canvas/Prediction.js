import React, { Component } from 'react'
import Box2 from './Box2'

import styles from './Prediction.module.css'

export default class Rect extends Component {
  render() {
    const { prediction, activePrediction, imageSize, cmap } = this.props
    const { bbox } = prediction
    const [x, y, width, height] = bbox
    const { imageWidth, imageHeight } = imageSize

    const dimensions = {
      left: x * imageWidth,
      top: y * imageHeight,
      width: width * imageWidth,
      height: height * imageHeight
    }

    const boxColor = (cmap && cmap[prediction.class]) || 'white'

    return (
      <>
        <div className={styles.wrapper} style={dimensions}>
          <div className={styles.label} style={{ background: boxColor }}>
            {prediction.class}
          </div>
        </div>
        <Box2
          bbox={{
            x: x,
            y: y,
            x2: x + width,
            y2: y + height,
            label: prediction.class
          }}
          cmap={cmap}
          hovered={activePrediction}
          imageSize={imageSize}
        />
      </>
    )
  }
}
