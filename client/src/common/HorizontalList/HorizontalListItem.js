import React, { useCallback } from 'react'

const style = { height: '80px', margin: '0 8px' }

const HorizontalListItem = React.memo(
  ({ onItemSelected, listItem, index, id }) => {
    console.log('fuck')
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
