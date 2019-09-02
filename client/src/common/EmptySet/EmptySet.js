import React, { Component } from 'react'
import styles from './EmptySet.module.css'

export default class EmptySet extends Component {
  render() {
    const { show } = this.props
    if (!show) {
      return null
    }

    return (
      <div className={styles.base}>
        <div className={styles.circle} />
        <div className={styles.image1} />
        <div className={styles.image2} />
        <div className={styles.textContainer}>
          <div className={styles.largeText}>No images</div>
          <div className={styles.smallText}>Drop and drop to upload media.</div>
        </div>
      </div>
    )
  }
}
