import React, { Component } from 'react'

import styles from './Prediction.module.css'

export default class Rect extends Component {
  render() {
    const { prediction, imageSize } = this.props
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
        <div className={styles.inline} />
      </div>
    )
  }
}
