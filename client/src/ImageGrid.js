import React, { Component } from 'react'
import GridIcon from './GridIcon'
import './ImageGrid.css'

class ImageGrid extends Component {
  render() {
    const { collection, selection, gridItemSelected, ...other } = this.props
    return (
      <div>
        {collection.map(section => {
          return (
            <div>
              <div className="ImageGrid-Section-Title">
                <div className="ImageGrid-Section-Span">{section.label}</div>
              </div>
              <div className="ImageGrid">
                {section.images.map((image, i) => {
                  return (
                    <GridIcon
                      image={image}
                      index={i}
                      selected={selection[i]}
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
