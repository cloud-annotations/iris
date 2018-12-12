import React, { Component } from 'react'
import './GridIcon.css'

class GridItem extends Component {
  handleClick = e => {
    const { onItemSelected, index } = this.props
    onItemSelected(e, index)
  }

  handleMouseDown = e => {
    const { onDragStart, index } = this.props
    if (e.button === 0) {
      onDragStart(index)
    }
  }

  handleMouseEnter = e => {
    const { onItemEntered, index } = this.props
    onItemEntered(index)
  }

  render() {
    const { selected, gridItem, imageUrl } = this.props
    return (
      <div
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onClick={this.handleClick}
        className={`GridIcon-Wrapper ${selected ? '--Active' : ''}`}
      >
        {React.cloneElement(gridItem, { imageUrl: imageUrl })}
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

export default GridItem
