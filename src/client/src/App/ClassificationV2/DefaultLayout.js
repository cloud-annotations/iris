import React from 'react'

const LEFT_WIDTH = '209px'

const DefaultLayout = ({ left, content }) => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          bottom: '0',
          width: LEFT_WIDTH
        }}
      >
        {left}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: LEFT_WIDTH,
          right: '0',
          bottom: '0'
        }}
      >
        {content}
      </div>
    </>
  )
}

export default DefaultLayout
