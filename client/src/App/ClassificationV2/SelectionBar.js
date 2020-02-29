import React from 'react'

import DropDown from './DropDown'

import styles from './SelectionBar.module.css'

const SelectionBar = ({
  selectionCount,
  sections,
  onItemChosen,
  unlabelImages,
  deleteImages,
  deselectAll
}) => {
  const onlyLabels = sections.filter(label => {
    return label.toLowerCase() !== 'unlabeled'
  })

  return (
    <div className={selectionCount > 0 ? styles.barActive : styles.bar}>
      <div className={styles.selectionCountWrapper}>
        <div className={styles.selectionCount}>{selectionCount} selected</div>
      </div>
      <DropDown
        label="Label"
        labels={onlyLabels}
        onItemChosen={onItemChosen}
        bar
      />
      <div className={styles.button} onClick={unlabelImages}>
        Unlabel
      </div>
      <div className={styles.button} onClick={deleteImages}>
        Delete
      </div>
      <div className={styles.lastButton} onClick={deselectAll}>
        <svg
          className={styles.dismissIcon}
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
          description="Clear selection"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"></path>
        </svg>
      </div>
    </div>
  )
}

export default SelectionBar
