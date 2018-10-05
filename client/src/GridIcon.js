import React, { Component } from 'react'
import localforage from 'localforage'
import { arrayBufferToBase64 } from './Utils'
import './GridIcon.css'

// TODO: IndexedDB might not be a good idea from a security standpoint.

class GridIcon extends Component {
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
    const url = `api/proxy/${localStorage.getItem('loginUrl')}/${this.props.bucket}/${imageUrl}`
    const options = {
      method: 'GET'
    }
    const request = new Request(url)
    fetch(request, options)
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

  onClick = e => {
    const { index, onItemSelected } = this.props
    onItemSelected(e, index)
  }

  render() {
    const { selected } = this.props

    return (
      <div
        onClick={this.onClick}
        className={`GridIcon-Wrapper ${selected ? '--Active' : ''}`}
      >
        <img className="GridIcon-Image" src={this.state.image} />
        <div className="GridIcon-check-IconWrapper">
          <svg
            className="GridIcon-check-Icon"
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

export default GridIcon
