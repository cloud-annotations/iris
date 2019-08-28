import React from 'react'
import HorizontalListController from 'common/HorizontalList/HorizontalListController'

import styles from './ImagesPanel.module.css'

const ImagesPanel = ({
  images,
  labels,
  handleImageFilterChange,
  cells,
  selectedIndex,
  handleSelectionChanged
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.labelFilterWrapper}>
        <div className={styles.labelCount}>
          {images.length.toLocaleString()}
        </div>
        <select className={styles.filter} onChange={handleImageFilterChange}>
          <option value="all">All Images</option>
          <option value="labeled">Labeled</option>
          <option value="unlabeled">Unlabeled</option>
        </select>
        <div className={styles.labelList}>
          {Object.keys(labels).map(label => (
            <div className={styles.labelItem}>
              <div>{label}</div>
              <div className={styles.labelItemCount}>{labels[label]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.imageList}>
        <HorizontalListController
          items={images}
          cells={cells}
          selection={selectedIndex}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  )
}

export default ImagesPanel
