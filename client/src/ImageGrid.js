import React, { Component } from 'react'
import GridIcon from './GridIcon'
import './ImageGrid.css'

class ImageGrid extends Component {
  render() {
    const {
      sections,
      selection,
      collection,
      gridItemSelected,
      ...other
    } = this.props
    var index = 0
    return (
      <div>
        {sections.map((section, i) => {
          return (
            <div key={section}>
              {collection[section].length > 0 ? (
                <div>
                  <div className="ImageGrid-Section-Title">
                    <div className="ImageGrid-Section-Span">{section}</div>
                  </div>
                  <div className="ImageGrid">
                    {collection[section].map((imagePointer, j) => {
                      const gridIcon = (
                        <GridIcon
                          key={imagePointer}
                          imageUrl={imagePointer}
                          index={index}
                          selected={selection[index]}
                          onItemSelected={gridItemSelected}
                        />
                      )
                      index++
                      return gridIcon
                    })}
                  </div>
                  <div className="ImageGrid-Gap" />
                </div>
              ) : (
                ''
              )}
            </div>
          )
        })}
      </div>
    )
  }
}

export default ImageGrid
