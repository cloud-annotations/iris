import React, { Component } from 'react'

import styles from './CardChoice.module.css'

export default class CardChoice extends Component {
  render() {
    return (
      <div
        onClick={this.props.onClick}
        className={this.props.selected ? styles.wrapperActive : styles.wrapper}
      >
        <div className={styles.titleWrapper}>
          <div className={styles.title}>{this.props.title}</div>
          {this.props.selected && (
            <svg
              className={styles.check}
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
            </svg>
          )}
        </div>
        <img className={styles.image} src={this.props.image} alt="" />
      </div>
    )
  }
}
