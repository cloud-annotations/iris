import React, { useCallback } from 'react'

const HorizontalListItem = React.memo(
  ({ onItemSelected, listItem, index, style, id }) => {
    const handleClick = useCallback(
      e => {
        onItemSelected(e, index)
      },
      [index, onItemSelected]
    )
    return (
      <div id={id} style={style} onClick={handleClick}>
        {listItem}
      </div>
    )
  }
)

export default HorizontalListItem
