import React from 'react'

const APP_BAR_HEIGHT = '64px'
const DIVIDER = '1px'

const AppBarLayout = ({ appBar, content }) => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '0',
          height: APP_BAR_HEIGHT,
          left: '0',
          right: '0'
        }}
      >
        {appBar}
      </div>
      <div
        style={{
          position: 'absolute',
          top: APP_BAR_HEIGHT,
          height: DIVIDER,
          left: '0',
          right: '0',
          backgroundColor: 'var(--border)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: `calc(${APP_BAR_HEIGHT} + ${DIVIDER})`,
          bottom: '0',
          left: '0',
          right: '0'
        }}
      >
        {content}
      </div>
    </>
  )
}

export default AppBarLayout
