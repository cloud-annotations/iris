import React, { Component } from 'react'

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
      >
        {React.cloneElement(gridItem, {
          imageUrl: imageUrl,
          selected: selected
        })}
      </div>
    )
  }
}

export default GridItem
