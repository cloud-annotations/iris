import React, { Component } from 'react'
import GridIcon from './GridIcon'
import { ALL_IMAGES, LABELED, UNLABELED } from './Sidebar'
import './ImageGrid.css'

class ImageGrid extends Component {
  render() {
    const {
      sections,
      selection,
      collection,
      currentSection,
      gridItemSelected,
      bucket,
      ...other
    } = this.props
    var index = 0
    return (
      <div>
        {sections.map((section, i) => {
          if (
            currentSection === ALL_IMAGES ||
            (currentSection === LABELED && section !== 'Unlabeled') ||
            (currentSection === UNLABELED && section === 'Unlabeled') ||
            currentSection === section
          ) {
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
                            bucket={bucket}
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
          } else {
            collection[section].map(() => {
              index++
            })
            return ''
          }
        })}
      </div>
    )
  }
}

export default ImageGrid
