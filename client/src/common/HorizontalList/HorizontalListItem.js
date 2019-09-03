import React, { useCallback } from 'react'

const HorizontalListItem = React.memo(
  ({ onItemSelected, selected, listItem, index, id }) => {
    const handleClick = useCallback(
      e => {
        onItemSelected(e, index)
      },
      [index, onItemSelected]
    )
    return (
      <div id={id} onClick={handleClick}>
        {React.cloneElement(listItem, { selected: selected })}
      </div>
    )
  }
)

export default HorizontalListItem
