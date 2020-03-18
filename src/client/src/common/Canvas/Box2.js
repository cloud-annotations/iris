import React, { Component } from 'react'

import styles from './Box2.module.css'

export default class Rect extends Component {
  render() {
    const { bbox, cmap, imageSize, hovered } = this.props
    const { x, y, x2, y2, label } = bbox
    const { imageWidth, imageHeight } = imageSize

    const dimensions = {
      left: x > x2 ? Math.round(x2 * imageWidth) : Math.round(x * imageWidth),
      top: y > y2 ? Math.round(y2 * imageHeight) : Math.round(y * imageHeight),
      width: Math.abs(Math.round((x2 - x) * imageWidth)),
      height: Math.abs(Math.round((y2 - y) * imageHeight))
    }

    const boxColor = (cmap && cmap[label]) || 'white'

    return (
      <div
        className={hovered ? styles.wrapperHover : styles.wrapper}
        style={dimensions}
      >
        <div className={styles.draw} style={{ borderColor: boxColor }} />
        <div className={styles.inline} />
        <div className={styles.outline} />
        <div className={styles.fill} style={{ backgroundColor: boxColor }} />
      </div>
    )
  }
}
