import React, { Component } from 'react'

import styles from './Nobs.module.css'

export default class Rect extends Component {
  render() {
    const { bbox, imageSize } = this.props
    const { x, y, x2, y2 } = bbox
    const { imageWidth, imageHeight } = imageSize

    const dimensions = {
      left: x > x2 ? Math.round(x2 * imageWidth) : Math.round(x * imageWidth),
      top: y > y2 ? Math.round(y2 * imageHeight) : Math.round(y * imageHeight),
      width: Math.abs(Math.round((x2 - x) * imageWidth)),
      height: Math.abs(Math.round((y2 - y) * imageHeight))
    }

    return (
      <div className={styles.wrapper} style={dimensions}>
        <div className={styles.topLeft} />
        <div className={styles.topRight} />
        <div className={styles.bottomRight} />
        <div className={styles.bottomLeft} />
      </div>
    )
  }
}
