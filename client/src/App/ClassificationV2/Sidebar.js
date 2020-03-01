import React, { useState, useEffect, useCallback, useRef } from 'react'
import { connect } from 'react-redux'

import styles from './Sidebar.module.css'
import { deleteLabel, createLabel, syncAction } from 'redux/collection'
import useOnClickOutside from 'hooks/useOnClickOutside'

export const ALL_IMAGES = 'all'
export const LABELED = 'labeled'
export const UNLABELED = 'unlabeled'

const CreateLabelInputButton = ({ onSubmit }) => {
  const [labelOpen, setLabelOpen] = useState(false)
  const [labelEditingValue, setEditingLabelValue] = useState('')

  const inputRef = useRef(null)

  const ref = useRef(null)
  const handleBlur = useCallback(() => {
    setEditingLabelValue('')
    setLabelOpen(false)
  }, [])
  useOnClickOutside(ref, handleBlur)

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
        onSubmit(inputRef.current.value)
        setEditingLabelValue('')
        // setLabelOpen(false)
      }
    },
    [onSubmit]
  )

  const handleEnter = useCallback(
    e => {
      onSubmit(inputRef.current.value)
      setEditingLabelValue('')
      // setLabelOpen(false)
    },
    [onSubmit]
  )

  const handleClick = useCallback(() => {
    setLabelOpen(true)
  }, [])

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={labelOpen ? styles.labelDropDownOpen : styles.labelDropDown}
    >
      {labelOpen ? (
        <>
          <input
            ref={inputRef}
            className={styles.editTextWrapper}
            readOnly={!labelOpen}
            // disabled={!labelOpen} this causes issues in FireFox
            placeholder="Label name"
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            value={labelEditingValue}
            type="text"
          />
          <div className={styles.editTextButton} onClick={handleEnter}>
            <svg className={styles.editTextIcon} viewBox="0 0 24 24">
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g transform="translate(-499.000000, -168.000000)">
                  <g transform="translate(495.000000, 164.000000)">
                    <g
                      transform="translate(4.000000, 4.000000)"
                      fill="var(--brightText)"
                      fill-rule="nonzero"
                    >
                      <polygon points="13 11 13 0 11 0 11 11 0 11 0 13 11 13 11 24 13 24 13 13 24 13 24 11"></polygon>
                    </g>
                    <g>
                      <rect x="0" y="0" width="32" height="32"></rect>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
            {/* <svg
              className={styles.editTextIcon}
              focusable="false"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <path d="M17 15L17 7 15 7 15 15 7 15 7 17 15 17 15 25 17 25 17 17 25 17 25 15 17 15z"></path>
            </svg> */}
          </div>
        </>
      ) : (
        <div className={styles.dropButtonText}>Create label</div>
      )}
    </div>
  )
}

const Sidebar = ({
  currentSection,
  allImagesCount,
  labeledCount,
  unlabeledCount,
  labels,
  onSectionChanged,
  syncAction
}) => {
  const handleCreateLabel = useCallback(
    value => {
      const trimmedCompare = Object.keys(labels).filter(label => {
        return value.trim() === label.trim()
      })
      if (value === '' || trimmedCompare.length > 0) {
        return
      }
      syncAction(createLabel, [value])
    },
    [labels, syncAction]
  )

  const handleDeleteLabel = useCallback(
    label => e => {
      e.stopPropagation()
      syncAction(deleteLabel, [label])
    },
    [syncAction]
  )

  const handleSectionChanged = useCallback(
    section => () => {
      onSectionChanged(section)
    },
    [onSectionChanged]
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.fixedItems}>
        <div
          className={
            currentSection === ALL_IMAGES ? styles.itemActive : styles.item
          }
          onClick={handleSectionChanged(ALL_IMAGES)}
        >
          <div className={styles.itemTitle}>All images</div>
          <div className={styles.itemCount}>
            {allImagesCount.toLocaleString()}
          </div>
        </div>
        <div
          className={
            currentSection === LABELED ? styles.itemActive : styles.item
          }
          onClick={handleSectionChanged(LABELED)}
        >
          <div className={styles.itemTitle}>Labeled</div>
          <div className={styles.itemCount}>
            {labeledCount.toLocaleString()}
          </div>
        </div>
        <div
          className={
            currentSection === UNLABELED ? styles.itemActive : styles.item
          }
          onClick={handleSectionChanged(UNLABELED)}
        >
          <div className={styles.itemTitle}>Unlabeled</div>
          <div className={styles.itemCount}>
            {unlabeledCount.toLocaleString()}
          </div>
        </div>
      </div>

      <CreateLabelInputButton onSubmit={handleCreateLabel} />

      <div className={styles.dynamicItems}>
        {Object.keys(labels).map(label => {
          return (
            <div
              className={
                currentSection === label ? styles.itemActive : styles.item
              }
              onClick={handleSectionChanged(label)}
            >
              <div className={styles.itemTitle}>{label}</div>
              <div className={styles.itemCount}>
                {labels[label].toLocaleString()}
              </div>
              <div
                className={styles.overflow}
                onClick={handleDeleteLabel(label)}
              >
                <svg height="12px" width="12px" viewBox="2 2 36 36">
                  <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const mapStateToProps = () => ({})
const mapDispatchToProps = {
  syncAction
}
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
