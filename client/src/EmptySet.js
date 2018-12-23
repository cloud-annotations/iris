import React, { Component } from 'react'
import { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import './EmptySet.css'

class EmptySet extends Component {
  render() {
    const { show } = this.props
    if (!show) {
      return ''
    }

    return (
      <div className="EmptySet">
        <div className="EmptySet-Circle" />
        <div className="EmptySet-Image" />
        <div className="EmptySet-Image2" />
        <div className="EmptySet-Text">
          <div className="EmptySet-Text-Big">Drop images here</div>
          <div className="EmptySet-Text-Small">
            or use the “Add Images” button.
          </div>
        </div>
      </div>
    )
  }
}

export default EmptySet
