import React, { Component } from 'react'

import styles from './TouchTargets.module.css'

export default class Rect extends Component {
  handleTopLeftCorner = e => {
    const { onCornerGrabbed, boxId } = this.props
    onCornerGrabbed(e, boxId, [0, 0])
  }

  handleTopRightCorner = e => {
    const { onCornerGrabbed, boxId } = this.props
    onCornerGrabbed(e, boxId, [1, 0])
  }

  handleBottomRightCorner = e => {
    const { onCornerGrabbed, boxId } = this.props
    onCornerGrabbed(e, boxId, [1, 1])
  }

  handleBottomLeftCorner = e => {
    const { onCornerGrabbed, boxId } = this.props
    onCornerGrabbed(e, boxId, [0, 1])
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
          onMouseDown={this.handleTopLeftCorner}
          onTouchStart={this.handleTopLeftCorner}
          className={styles.topLeft}
        />
        <div
          onMouseDown={this.handleTopRightCorner}
          onTouchStart={this.handleTopRightCorner}
          className={styles.topRight}
        />
        <div
          onMouseDown={this.handleBottomRightCorner}
          onTouchStart={this.handleBottomRightCorner}
          className={styles.bottomRight}
        />
        <div
          onMouseDown={this.handleBottomLeftCorner}
          onTouchStart={this.handleBottomLeftCorner}
          className={styles.bottomLeft}
        />
      </div>
    )
  }
}
