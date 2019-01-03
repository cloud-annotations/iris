import React, { Component } from 'react'

export default class HorizontalListItem extends Component {
  handleClick = e => {
    const { onItemSelected, index } = this.props
    onItemSelected(e, index)
  }

  render() {
    const { listItem, style } = this.props
    return (
      <div style={style} onClick={this.handleClick}>
        {listItem}
      </div>
    )
  }
}
