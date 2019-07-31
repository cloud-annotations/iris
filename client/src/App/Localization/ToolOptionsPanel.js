import React, { useState, useCallback, useEffect, useRef } from 'react'

import styles from './ToolOptionsPanel.module.css'

const ToolOptionsPanel = () => {
  const [labelOpen, setLabelOpen] = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    // calling this directly after setEditing doesn't work, which is why we need
    // to use and effect.
    if (labelOpen) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [labelOpen])

  const handleBlur = useCallback(() => {
    setLabelOpen(false)
  }, [])

  const handleKeyPress = useCallback(e => {
    if (e.key === 'Enter') {
      setLabelOpen(false)
    }
  }, [])

  const handleClick = useCallback(() => {
    setLabelOpen(true)
  }, [])

  const activeLabel = 'Untitled Label'
  const labels = [
    'label1',
    'really really really really really really long label name',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label3',
    'label4'
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.divider} />
      <div
        onClick={handleClick}
        className={labelOpen ? styles.labelDropDownOpen : styles.labelDropDown}
      >
        <div className={labelOpen ? styles.cardOpen : styles.card}>
          {labels.map(label => (
            <div className={styles.listItem} key={label}>
              {label}
            </div>
          ))}
        </div>
        <input
          ref={inputRef}
          className={styles.editTextWrapper}
          readOnly={!labelOpen}
          disabled={!labelOpen}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          defaultValue={activeLabel}
          type="text"
        />
        <svg
          className={styles.dropDownIcon}
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" />
        </svg>
      </div>
      <div className={styles.divider} />
    </div>
  )
}

export default ToolOptionsPanel
