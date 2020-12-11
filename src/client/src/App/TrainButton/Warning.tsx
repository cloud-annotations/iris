import React from 'react'

import styles from './dialog.module.css'

interface Props {
  title: string
  children: React.ReactNode
}

function Warning({ title, children }: Props) {
  return (
    <div className={styles.popupWarning}>
      <svg
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M10,1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S15,1,10,1z M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1	s1,0.4,1,1S10.6,16,10,16z"></path>
        <path
          d="M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S10.6,16,10,16z"
          data-icon-path="inner-path"
          opacity="0"
        ></path>
        <title>warning icon</title>
      </svg>
      <div className={styles.popupWarningBody}>
        <div className={styles.popupWarningTitle}>{title}</div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Warning
