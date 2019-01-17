import React, { Component } from 'react'
import './SelectionBar.css'
import DropDown from './DropDown'

class SelectionBar extends Component {
  render() {
    const {
      selectionCount,
      sections,
      onItemChosen,
      unlabelImages,
      deleteImages,
      deselectAll
    } = this.props

    const onlyLabels = sections.filter(label => {
      return label.toLowerCase() !== 'unlabeled'
    })
    return (
      <div className={`SelectionBar ${selectionCount > 0 ? '--Active' : ''}`}>
        <div className="SelectionBar-Wrapper SelectionBar-count-Wrapper">
          <div className="SelectionBar-count">{`${selectionCount} selected`}</div>
        </div>
        <div className="">
          <DropDown
            label="Label"
            labels={onlyLabels}
            onItemChosen={onItemChosen}
            bar
          />
        </div>
        <div
          className="SelectionBar-Wrapper SelectionBar-Button"
          onClick={unlabelImages}
        >
          <div>Unlabel</div>
        </div>
        <div
          className="SelectionBar-Wrapper SelectionBar-Button"
          onClick={deleteImages}
        >
          <div>Delete</div>
        </div>
        <div
          className="SelectionBar-close-IconWrapper SelectionBar-Wrapper SelectionBar-Button"
          onClick={deselectAll}
        >
          <svg className="SelectionBar-close-Icon" viewBox="5 5 10 10">
            <path d="M10 9.293l4.146-4.147.708.708L10.707 10l4.147 4.146-.708.708L10 10.707l-4.146 4.147-.708-.708L9.293 10 5.146 5.854l.708-.708L10 9.293z" />
          </svg>
        </div>
      </div>
    )
  }
}

export default SelectionBar
