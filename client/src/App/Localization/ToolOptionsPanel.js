import React, { useState, useCallback, useEffect, useRef } from 'react'
import { connect } from 'react-redux'

import { setActiveLabel } from 'redux/editor'
import { createLabel, syncAction } from 'redux/collection'
import styles from './ToolOptionsPanel.module.css'
import useOnClickOutside from 'hooks/useOnClickOutside'

const mapStateToProps = state => ({
  activeLabel: state.editor.label,
  labels: state.collection.labels
})
const mapDispatchToProps = {
  setActiveLabel,
  syncAction
}
const LabelDropDown = connect(
  mapStateToProps,
  mapDispatchToProps
)(({ labels, activeLabel, setActiveLabel, syncAction }) => {
  const [labelOpen, setLabelOpen] = useState(false)
  const [labelEditingValue, setEditingLabelValue] = useState(undefined)

  const inputRef = useRef(null)

  const ref = useRef(null)
  const handleBlur = useCallback(() => {
    setEditingLabelValue(undefined)
    setLabelOpen(false)
  }, [])
  useOnClickOutside(ref, handleBlur)

  useEffect(() => {
    if (labels.length > 0) {
      if (!labels.includes(activeLabel)) {
        setActiveLabel(labels[0])
      } else {
        // Do nothing.
      }
    } else {
      setActiveLabel('Untitled Label')
    }
  }, [activeLabel, labels, setActiveLabel])

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
            syncAction(createLabel, [newActiveLabel])
          }
          setActiveLabel(newActiveLabel)
        }
        setEditingLabelValue(undefined)
        setLabelOpen(false)
      }
    },
    [syncAction, labels, setActiveLabel]
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
        // disabled={!labelOpen} this causes issues in FireFox
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        // We need to use undefined because and empty string is falsy
        value={
          labelEditingValue !== undefined
            ? labelEditingValue
            : activeLabel || '' // If active label happens to be undefined the component will become uncontrolled.
        }
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
