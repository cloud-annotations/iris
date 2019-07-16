import React, { useCallback } from 'react'

const style = { height: '80px', margin: '0 8px' }

const HorizontalListItem = React.memo(
  ({ onItemSelected, selected, listItem, index, id }) => {
    const handleClick = useCallback(
      e => {
        onItemSelected(e, index)
      },
      [index, onItemSelected]
    )
    return (
      <div id={id} style={style} onClick={handleClick}>
        {React.cloneElement(listItem, { selected: selected })}
      </div>
    )
  }
)

export default HorizontalListItem
