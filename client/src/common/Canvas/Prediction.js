import React, { Component } from 'react'

import { BOX } from './Canvas'

import styles from './Box.module.css'

export default class Rect extends Component {
  render() {
    const { prediction, activePrediction, imageSize } = this.props
    const { bbox } = prediction
    const [x, y, width, height] = bbox
    const { imageWidth, imageHeight } = imageSize

    const dimensions = {
      left: x * imageWidth,
      top: y * imageHeight,
      width: width * imageWidth,
      height: height * imageHeight
    }

    return (
      <div className={styles.wrapper} style={dimensions}>
        <div
          className={styles.draw}
          style={{ borderColor: activePrediction ? 'blue' : 'red' }}
        />
        {this.props.mode === BOX && (
          <div className={styles.fill} style={{ backgroundColor: 'red' }} />
        )}
      </div>
    )
  }
}
