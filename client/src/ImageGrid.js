import React, { Component } from 'react'
import GridIcon from './GridIcon'
import './ImageGrid.css'

class ImageGrid extends Component {
  render() {
    const {
      sections,
      selection,
      collection,
      images,
      gridItemSelected,
      ...other
    } = this.props
    return (
      <div>
        {sections.map((section, i) => {
          return (
            <div>
              <div className="ImageGrid-Section-Title">
                <div className="ImageGrid-Section-Span">{section}</div>
              </div>
              <div className="ImageGrid">
                {collection[section].map((imagePointer, j) => {
                  return (
                    <GridIcon
                      imageData={images[imagePointer].data}
                      index={(i + 1) * j}
                      selected={selection[(i + 1) * j]}
                      onItemSelected={gridItemSelected}
                    />
                  )
                })}
              </div>
              <div className="ImageGrid-Gap" />
            </div>
          )
        })}
      </div>
    )
  }
}

export default ImageGrid
