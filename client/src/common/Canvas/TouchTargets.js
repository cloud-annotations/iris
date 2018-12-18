import React, { Component } from 'react'

import styles from './TouchTargets.module.css'

export default class Rect extends Component {
  handleMouseDown = e => {
    const { onCornerGrabbed, index } = this.props
    onCornerGrabbed(e, index)
  }

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
        <div
          id="00"
          onMouseDown={this.handleMouseDown}
          className={styles.topLeft}
        />
        <div
          id="10"
          onMouseDown={this.handleMouseDown}
          className={styles.topRight}
        />
        <div
          id="11"
          onMouseDown={this.handleMouseDown}
          className={styles.bottomRight}
        />
        <div
          id="01"
          onMouseDown={this.handleMouseDown}
          className={styles.bottomLeft}
        />
      </div>
    )
  }
}
