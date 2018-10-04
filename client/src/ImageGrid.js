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
      bucket
    } = this.props
    return (
      <div>
        {sections.map(
          (acc => section => {
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
                        {collection[section].map(imagePointer => {
                          const gridIcon = (
                            <GridIcon
                              bucket={bucket}
                              key={imagePointer}
                              imageUrl={imagePointer}
                              index={acc}
                              selected={selection[acc]}
                              onItemSelected={gridItemSelected}
                            />
                          )
                          acc++
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
              collection[section].forEach(() => {
                acc++
              })
              return ''
            }
          })(0)
        )}
      </div>
    )
  }
}

export default ImageGrid
