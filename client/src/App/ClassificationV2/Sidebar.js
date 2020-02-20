import React, { useState, useEffect, useCallback } from 'react'
import { connect } from 'react-redux'

import styles from './Sidebar.module.css'
import { deleteLabel, createLabel, syncAction } from 'redux/collection'

export const ALL_IMAGES = 'all'
export const LABELED = 'labeled'
export const UNLABELED = 'unlabeled'

const Sidebar = ({
  currentSection,
  allImagesCount,
  labeledCount,
  unlabeledCount,
  labels,
  onSectionChanged,
  syncAction
}) => {
  const [addingLabels, setAddingLabels] = useState(false)
  const [inputWrapperRef, setInputWrapperRef] = useState()
  const [inputRef, setInputRef] = useState()

  useEffect(() => {
    const handleClickOutside = e => {
      if (inputWrapperRef && !inputWrapperRef.contains(e.target)) {
        setAddingLabels(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [inputWrapperRef])

  const handleCreateLabel = useCallback(() => {
    const { value } = inputRef
    const trimmedCompare = Object.keys(labels).filter(label => {
      return value.trim() === label.trim()
    })
    if (value === '' || trimmedCompare.length > 0) {
      return
    }
    syncAction(createLabel, [value])
    inputRef.value = ''
  }, [inputRef, labels, syncAction])

  const handleDeleteLabel = useCallback(
    label => e => {
      e.stopPropagation()
      syncAction(deleteLabel, [label])
    },
    [syncAction]
  )

  const handleKeyPress = useCallback(
    e => {
      if (e.key === 'Enter') {
        handleCreateLabel()
      }
    },
    [handleCreateLabel]
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

        {addingLabels ? (
          <div className={styles.addLabelFieldWrapper} ref={setInputWrapperRef}>
            <input
              className={styles.addLabelField}
              type="text"
              placeholder="Label name"
              ref={setInputRef}
              onKeyPress={handleKeyPress}
            />
            <div
              className={styles.thinAddIconWrapper}
              onClick={handleCreateLabel}
            >
              <svg
                className={styles.thinAddIcon}
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M8.57142857 4H7.42857143v3.42857143H4v1.14285714h3.42857143V12h1.14285714V8.57142857H12V7.42857143H8.57142857z" />
                <path d="M8 14.8571429c-3.78114286 0-6.85714286-3.076-6.85714286-6.8571429 0-3.78114286 3.076-6.85714286 6.85714286-6.85714286 3.7811429 0 6.8571429 3.076 6.8571429 6.85714286 0 3.7811429-3.076 6.8571429-6.8571429 6.8571429M8 0C3.58228571 0 0 3.58228571 0 8c0 4.4177143 3.58228571 8 8 8 4.4177143 0 8-3.5822857 8-8 0-4.41771429-3.5822857-8-8-8" />
              </svg>
            </div>
          </div>
        ) : null}
        <div
          className={
            addingLabels ? styles.addLabelButtonHidden : styles.addLabelButton
          }
          onClick={() => {
            setAddingLabels(true)
            if (inputRef) {
              inputRef.focus()
            }
          }}
        >
          Add Label
        </div>
      </div>

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
            <div className={styles.overflow} onClick={handleDeleteLabel(label)}>
              <svg height="12px" width="12px" viewBox="2 2 36 36">
                <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
              </svg>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const mapStateToProps = () => ({})
const mapDispatchToProps = {
  syncAction
}
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
