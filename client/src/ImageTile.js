import React, { Component } from 'react'
import fetchImage from 'api/fetchImage'
import styles from './ImageTile.module.css'

export default class ImageTile extends Component {
  state = {
    image:
      'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  }

  componentDidMount() {
    const { bucket, item } = this.props
    console.log("Hello, I'm a new kid.")
    fetchImage(localStorage.getItem('loginUrl'), bucket, item)
      .then(res => {
        this.setState(res)
      })
      .catch(error => {
        console.error(error)
      })
  }

  render() {
    const { selected } = this.props
    return (
      <div className={selected ? styles.selected : styles.container}>
        <img
          draggable={false}
          className={styles.image}
          alt=""
          src={this.state.image}
        />
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
          </svg>
        </div>
      </div>
    )
  }
}
