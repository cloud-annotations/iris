import React, { useState, useCallback, useEffect, useRef } from 'react'
import { connect } from 'react-redux'

import { setActiveLabel } from 'redux/editor'
import { createLabel } from 'redux/collection'
import styles from './ToolOptionsPanel.module.css'

const mapStateToProps = state => ({
  activeLabel: state.editor.label,
  labels: state.collection.labels
})
const mapDispatchToProps = {
  setActiveLabel,
  createLabel
}
const LabelDropDown = connect(
  mapStateToProps,
  mapDispatchToProps
)(({ labels, activeLabel, setActiveLabel, createLabel }) => {
  const [labelOpen, setLabelOpen] = useState(false)
  const [labelEditingValue, setEditingLabelValue] = useState(undefined)

  const inputRef = useRef(null)

  // If there's no active label, use the first label in the list. If the
  // list is empty, use a default label of `Untitled Label`.
  const labelValue =
    activeLabel || (labels.length > 0 ? labels[0] : 'Untitled Label')

  useEffect(() => {
    // calling this directly after setEditing doesn't work, which is why we need
    // to use and effect.
    if (labelOpen) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [labelOpen])

  const handleBlur = useCallback(() => {
    setEditingLabelValue(undefined)
    setLabelOpen(false)
  }, [])

  const handleChange = useCallback(e => {
    setEditingLabelValue(e.target.value)
  }, [])

  const handleKeyPress = useCallback(
    e => {
      if (e.key === 'Enter') {
        const newActiveLabel = inputRef.current.value.trim()
        if (newActiveLabel) {
          if (!labels.includes(newActiveLabel)) {
            createLabel(newActiveLabel)
          }
          setActiveLabel(newActiveLabel)
        }
        setEditingLabelValue(undefined)
        setLabelOpen(false)
      }
    },
    [createLabel, labels, setActiveLabel]
  )

  const handleClick = useCallback(() => {
    setLabelOpen(true)
  }, [])

  return (
    <div
      onClick={handleClick}
      className={labelOpen ? styles.labelDropDownOpen : styles.labelDropDown}
    >
      {labels.length > 0 && (
        <div className={labelOpen ? styles.cardOpen : styles.card}>
          {labels.map(label => (
            <div className={styles.listItem} key={label}>
              {label}
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        className={styles.editTextWrapper}
        readOnly={!labelOpen}
        disabled={!labelOpen}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        // We need to use undefined because and empty string is falsy
        value={labelEditingValue !== undefined ? labelEditingValue : labelValue}
        type="text"
      />
      <svg
        className={styles.dropDownIcon}
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" />
      </svg>
    </div>
  )
})

const ToolOptionsPanel = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.divider} />
      <LabelDropDown />
      <div className={styles.divider} />
    </div>
  )
}

export default ToolOptionsPanel
