import React from 'react'

import styles from './FloatingButton.module.css'

function FloatingButton({ children, onClick, label }) {
  return (
    <div className={styles.floatingButton}>
      {label && <button onClick={onClick}>{label}</button>}
      {children}
    </div>
  )
}

export default FloatingButton
