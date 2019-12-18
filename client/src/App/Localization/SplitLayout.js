import React from 'react'

const BOTTOM_HEIGHT = '64px'

const EXPANDED_HEIGHT = '241px'

const SplitLayout = ({ expandBottom, top, bottom }) => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          // height: expandBottom ? undefined : undefined,
          bottom: expandBottom ? EXPANDED_HEIGHT : BOTTOM_HEIGHT
        }}
      >
        {top}
      </div>
      <div
        style={{
          position: 'absolute',
          right: '0',
          left: '0',
          bottom: '0',
          height: expandBottom ? EXPANDED_HEIGHT : BOTTOM_HEIGHT
          // top: expandBottom ? undefined : undefined
        }}
      >
        {bottom}
      </div>
    </>
  )
}

export default SplitLayout
