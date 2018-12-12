import React, { Component } from 'react'
import localforage from 'localforage'
import { arrayBufferToBase64 } from './Utils'
import './GridIcon.css'

class ImageTile extends Component {
  state = {
    image:
      'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  }

  componentDidMount() {
    console.log("Hello, I'm a new kid.")
    const { imageUrl } = this.props
    localforage.getItem(imageUrl).then(data => {
      if (data === null || data === '') {
        this.loadImage(imageUrl)
      } else {
        this.setState({
          image: data
        })
      }
    })
  }

  loadImage = imageUrl => {
    const { bucket } = this.props
    const url = `/api/proxy/${localStorage.getItem(
      'loginUrl'
    )}/${bucket}/${imageUrl}`
    fetch(url)
      .then(response => {
        if (response.status !== 200) {
          return Promise.reject('Status not 200!')
        }
        return response.arrayBuffer()
      })
      .then(buffer => {
        const base64Flag = 'data:image/jpeg;base64,'
        const imageStr = arrayBufferToBase64(buffer)
        localforage.setItem(imageUrl, base64Flag + imageStr)
        this.setState({
          image: base64Flag + imageStr
        })
      })
      .catch(error => {
        console.error(error)
      })
  }

  render() {
    return <img className="GridIcon-Image" alt="" src={this.state.image} />
  }
}

export default ImageTile
