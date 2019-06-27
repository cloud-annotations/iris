import React, { useRef, useCallback, useEffect } from 'react'

import HorizontalListItem from './HorizontalListItem'

const style = {
  position: 'absolute',
  bottom: '0',
  left: '0',
  right: '0',
  top: '0',
  display: 'flex',
  overflow: 'auto',
  alignItems: 'center',
  backgroundColor: 'var(--secondaryBg)'
  // borderTop: '1px solid #dfe3e6'
}

const HorizontalListController = ({
  cells,
  items,
  selection,
  onSelectionChanged
}) => {
  const horizontalScrollRef = useRef(null)

  const handleKeyDown = useCallback(
    e => {
      if (document.activeElement.tagName.toLowerCase() === 'input') {
        return
      }

      const char = e.key.toLowerCase()

      const left = Math.max(selection - 1, 0)
      const right = Math.min(selection + 1, items.length - 1)
      if (char === 'arrowright') {
        e.preventDefault()
        onSelectionChanged(right)
        const target = document.getElementById(items[right])
        if (!target) {
          return
        }
        target.parentNode.scrollLeft =
          target.offsetLeft - (target.parentNode.offsetWidth / 2 - 208)
      } else if (char === 'arrowleft') {
        e.preventDefault()
        onSelectionChanged(left)
        const target = document.getElementById(items[left])
        if (!target) {
          return
        }
        target.parentNode.scrollLeft =
          target.offsetLeft - (target.parentNode.offsetWidth / 2 - 208)
      } else if (char === ' ') {
        e.preventDefault()
        onSelectionChanged(right)
        const target = document.getElementById(items[right])
        if (!target) {
          return
        }
        target.parentNode.scrollLeft =
          target.offsetLeft - (target.parentNode.offsetWidth / 2 - 208)
      }
    },
    [items, onSelectionChanged, selection]
  )

  const blockSwipeBack = e => {
    e.stopPropagation()
    const scrollElement = horizontalScrollRef.current
    if (!scrollElement.contains(e.target)) {
      return
    }

    e.preventDefault()
    const max = scrollElement.scrollWidth - scrollElement.offsetWidth
    const scrollPosition =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? scrollElement.scrollLeft + e.deltaX
        : scrollElement.scrollLeft + e.deltaY
    scrollElement.scrollLeft = Math.max(0, Math.min(max, scrollPosition))
  }

  useEffect(() => {
    document.addEventListener('mousewheel', blockSwipeBack, {
      passive: false
    })
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousewheel', blockSwipeBack)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const handleItemSelected = useCallback(
    (_, index) => {
      onSelectionChanged(index)
    },
    [onSelectionChanged]
  )

  return (
    <div ref={horizontalScrollRef} style={style}>
      {cells.map((cell, i) => {
        return (
          <HorizontalListItem
            index={i}
            id={items[i]}
            key={items[i]}
            selected={selection === i}
            onItemSelected={handleItemSelected}
            listItem={cell}
          />
        )
      })}
    </div>
  )
}

export default HorizontalListController
