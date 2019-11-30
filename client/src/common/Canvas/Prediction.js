import React, { Component } from 'react'

import styles from './Prediction.module.css'

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

    if (activePrediction) {
      return (
        <div className={styles.wrapper} style={dimensions}>
          <div className={styles.label}>{prediction.class}</div>
          <div className={styles.inline} />
          <div
            className={styles.outline}
            style={{ borderColor: 'var(--blue)' }}
          />
          <div className={styles.fill} />
        </div>
      )
    }
    return (
      <div className={styles.wrapper} style={dimensions}>
        <div className={styles.label2}>{prediction.class}</div>
      </div>
    )
  }
}
