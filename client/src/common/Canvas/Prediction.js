import React, { Component } from 'react'
import Box2 from './Box2'

import styles from './Prediction.module.css'

const textColorForBackground = bgColor => {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor
  const r = parseInt(color.substring(0, 2), 16) // hexToR
  const g = parseInt(color.substring(2, 4), 16) // hexToG
  const b = parseInt(color.substring(4, 6), 16) // hexToB
  const uicolors = [r / 255, g / 255, b / 255]
  const c = uicolors.map(col => {
    if (col <= 0.03928) {
      return col / 12.92
    }
    return Math.pow((col + 0.055) / 1.055, 2.4)
  })
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  return L > 0.179 ? '#000000' : '#ffffff'
}

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

    const boxColor = (cmap && cmap[prediction.class]) || '#ffffff'

    return (
      <>
        <div className={styles.wrapper} style={dimensions}>
          <div
            className={styles.label}
            style={{
              background: boxColor,
              color: textColorForBackground(boxColor)
            }}
          >
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
