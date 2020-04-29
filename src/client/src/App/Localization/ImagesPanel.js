import React, { useEffect, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import HorizontalListController from 'common/HorizontalList/HorizontalListController'
import { deleteLabel, syncAction } from 'redux/collection'

import styles from './ImagesPanel.module.css'

const blockSwipeBack = (element) => (e) => {
  e.stopPropagation()
  if (!element.contains(e.target)) {
    return
  }

  e.preventDefault()
  const max = element.scrollWidth - element.offsetWidth
  const scrollPosition =
    Math.abs(e.deltaX) > Math.abs(e.deltaY)
      ? element.scrollLeft + e.deltaX
      : element.scrollLeft + e.deltaY
  element.scrollLeft = Math.max(0, Math.min(max, scrollPosition))
}

const useBlockSwipeBack = (ref) => {
  useEffect(() => {
    const current = ref.current
    document.addEventListener('mousewheel', blockSwipeBack(current), {
      passive: false,
    })
    return () => {
      document.removeEventListener('mousewheel', blockSwipeBack(current))
    }
  }, [ref])
}

const ImagesPanel = ({
  images,
  labels,
  imageFilter,
  handleImageFilterChange,
  cells,
  selectedIndex,
  handleSelectionChanged,
  syncAction,
  range,
  allImageCount,
}) => {
  const scrollElementRef = useRef(null)
  useBlockSwipeBack(scrollElementRef)

  const handleDelete = useCallback(
    (label) => (e) => {
      e.stopPropagation()
      const deleteTheLabel = window.confirm(
        `Are you sure you want to delete the label "${label}"? This action will delete any bounding boxes associated with this label.`
      )
      if (deleteTheLabel) {
        syncAction(deleteLabel, [label])
      }
    },
    [syncAction]
  )

  const handleClickLabel = useCallback(
    (label) => () => {
      handleImageFilterChange({ target: { value: label } })
    },
    [handleImageFilterChange]
  )

  const actualLabelMode =
    imageFilter !== true && imageFilter !== false && imageFilter !== undefined

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelFilterWrapper}>
        {actualLabelMode ? (
          <>
            <div className={styles.labelCount}>
              {allImageCount.toLocaleString()}
            </div>
            <div
              onClick={handleClickLabel('all')}
              className={styles.filterNotSelected}
            >
              All Images
            </div>
          </>
        ) : (
          <>
            <div className={styles.labelCount}>
              {images.length.toLocaleString()}
            </div>
            <select
              className={styles.filter}
              onChange={handleImageFilterChange}
            >
              <option value="all">All Images</option>
              <option value="labeled">Labeled</option>
              <option value="unlabeled">Unlabeled</option>
            </select>
          </>
        )}

        <div ref={scrollElementRef} className={styles.labelList}>
          {Object.keys(labels).map((label) => (
            <div
              key={label}
              className={
                imageFilter === label
                  ? styles.selectedLabelItem
                  : styles.labelItem
              }
              onClick={handleClickLabel(label)}
            >
              <div>{label}</div>
              <div className={styles.labelItemCount}>{labels[label]}</div>
              <div onClick={handleDelete(label)} className={styles.deleteIcon}>
                <svg height="12px" width="12px" viewBox="2 2 36 36">
                  <g>
                    <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
                  </g>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.imageList}>
        <HorizontalListController
          items={images}
          cells={cells}
          range={range}
          selection={selectedIndex}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  )
}

const mapDispatchToProps = {
  syncAction,
}
export default connect(undefined, mapDispatchToProps)(ImagesPanel)
