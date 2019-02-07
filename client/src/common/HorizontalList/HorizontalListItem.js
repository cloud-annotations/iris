import React, { PureComponent } from 'react'

export default class HorizontalListItem extends PureComponent {
  handleClick = e => {
    const { onItemSelected, index } = this.props
    onItemSelected(e, index)
  }

  render() {
    const { listItem, style, id } = this.props
    return (
      <div id={id} style={style} onClick={this.handleClick}>
        {listItem}
      </div>
    )
  }
}
