import React, { useState, useCallback, useEffect, useRef } from 'react'
import { connect } from 'react-redux'

import { setActiveLabel } from 'redux/editor'
import { createLabel } from 'redux/collection'
import styles from './ToolOptionsPanel.module.css'

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = e => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(e.target)) {
        return
      }
      handler(e)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

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

  const ref = useRef(null)
  const handleBlur = useCallback(() => {
    setEditingLabelValue(undefined)
    setLabelOpen(false)
  }, [])
  useOnClickOutside(ref, handleBlur)

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

  const handleLabelChosen = useCallback(
    label => e => {
      e.stopPropagation()
      setActiveLabel(label)
      setEditingLabelValue(undefined)
      setLabelOpen(false)
    },
    [setActiveLabel]
  )

  const query = (labelEditingValue || '').trim()
  const filteredLabels =
    query === ''
      ? labels
      : labels
          // If the query is at the begining of the label.
          .filter(item => item.toLowerCase().indexOf(query.toLowerCase()) === 0)
          // Only sort the list when we filter, to make it easier to see diff.
          .sort((a, b) => a.length - b.length)

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={labelOpen ? styles.labelDropDownOpen : styles.labelDropDown}
    >
      {filteredLabels.length > 0 && (
        <div className={labelOpen ? styles.cardOpen : styles.card}>
          {filteredLabels.map(label => (
            <div
              className={styles.listItem}
              key={label}
              onClick={handleLabelChosen(label)}
            >
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
