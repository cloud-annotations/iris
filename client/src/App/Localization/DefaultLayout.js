import React from 'react'

const TOP_HEIGHT = '35px'
const LEFT_WIDTH = '50px'
const RIGHT_WIDTH = '272px'
const BOTTOM_HEIGHT = '116px'

const DefaultLayout = ({ top, left, content, right, bottom }) => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: TOP_HEIGHT
        }}
      >
        {top}
      </div>
      <div
        style={{
          position: 'absolute',
          top: TOP_HEIGHT,
          left: '0',
          bottom: BOTTOM_HEIGHT,
          width: LEFT_WIDTH
        }}
      >
        {left}
      </div>
      <div
        style={{
          position: 'absolute',
          top: TOP_HEIGHT,
          left: LEFT_WIDTH,
          right: RIGHT_WIDTH,
          bottom: BOTTOM_HEIGHT
        }}
      >
        {content}
      </div>
      <div
        style={{
          position: 'absolute',
          top: TOP_HEIGHT,
          right: '0',
          bottom: BOTTOM_HEIGHT,
          width: RIGHT_WIDTH
        }}
      >
        {right}
      </div>
      <div
        style={{
          position: 'absolute',
          right: '0',
          left: '0',
          bottom: '0',
          height: BOTTOM_HEIGHT
        }}
      >
        {bottom}
      </div>
    </>
  )
}

export default DefaultLayout
