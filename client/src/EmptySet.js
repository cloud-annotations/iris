import React, { Component } from 'react'
import { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import './EmptySet.css'

class EmptySet extends Component {
  render() {
    const { forceHide, sections, collection, currentSection } = this.props
    if (forceHide) {
      return ''
    }

    if (currentSection === ALL_IMAGES) {
      const count = sections.reduce((acc, label) => {
        return acc + collection[label].length
      }, 0)
      if (count !== 0) {
        return ''
      }
    } else if (currentSection === UNLABELED) {
      const count = sections.reduce((acc, label) => {
        if (label === 'Unlabeled') {
          return acc + collection[label].length
        }
        return acc
      }, 0)
      if (count !== 0) {
        return ''
      }
    } else if (currentSection === LABELED) {
      const count = sections.reduce((acc, label) => {
        if (label !== 'Unlabeled') {
          return acc + collection[label].length
        }
        return acc
      }, 0)
      if (count !== 0) {
        return ''
      }
    } else {
      const count = collection[currentSection].length
      if (count !== 0) {
        return ''
      }
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
