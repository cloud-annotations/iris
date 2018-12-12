import React, { Component } from 'react'

export default class GridItem extends Component {
  handleClick = e => {
    const { onItemSelected, index } = this.props
    onItemSelected(e, index)
  }

  handleMouseDown = e => {
    const { onDragStart, section, index } = this.props
    // Start drag if it was a left click.
    if (e.button === 0) {
      onDragStart(section, index)
    }
  }

  handleMouseEnter = e => {
    const { onItemEntered, section, index } = this.props
    onItemEntered(section, index)
  }

  render() {
    const { selected, gridItem, itemData } = this.props
    return (
      <div
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onClick={this.handleClick}
      >
        {React.cloneElement(gridItem, {
          itemData: itemData,
          selected: selected
        })}
      </div>
    )
  }
}
