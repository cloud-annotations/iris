import React, { useState, useCallback } from 'react'
import { connect } from 'react-redux'

import GridControllerV2 from 'common/Grid/GridControllerV2'
import EmptySet from 'common/EmptySet/EmptySet'
import SelectionBar from './SelectionBar'
import { UNLABELED, LABELED } from './Sidebar'
import ImageTile from './ImageTile'
import {
  syncAction,
  labelImagesV2,
  deleteImages,
  clearLabels,
  createLabel
} from 'redux/collection'

import styles from './GridPanel.module.css'
import { ALL_IMAGES } from 'App/Classification/Sidebar'

const GridControllerDelegate = (labels, images, bucket, endpoint) => {
  return {
    numberOfSections: labels.length,
    numberOfItemsInSection: sectionIndex => images[labels[sectionIndex]].length,
    keyForHeaderInSection: sectionIndex => labels[sectionIndex],
    titleForHeaderInSection: sectionIndex => {
      const label = labels[sectionIndex]
      return label === UNLABELED ? 'Unlabeled' : label
    },
    keyForItemAt: (sectionIndex, index) => {
      const section = labels[sectionIndex]
      return images[section][index]
    },
    cellForItemAt: (sectionIndex, index, selected) => {
      const section = labels[sectionIndex]
      return (
        <ImageTile
          endpoint={endpoint}
          bucket={bucket}
          selected={selected}
          item={images[section][index]}
        />
      )
    }
  }
}

const getSelectedImages = (selection, groupedImages, visibleLabels) => {
  const visibleImages = visibleLabels.reduce((acc, label) => {
    return [...acc, ...groupedImages[label]]
  }, [])
  return visibleImages.filter((_, i) => selection[i])
}

const GridPanel = ({
  bucket,
  endpoint,
  section,
  labels,
  groupedImages,
  syncAction
}) => {
  const [selection, setSelection] = useState([])

  const selectionCount = selection.filter(Boolean).length

  const loading = false
  const isEmpty = false

  let visibleLabels
  switch (section) {
    case ALL_IMAGES:
      visibleLabels = ['unlabeled', ...labels]
      break
    case UNLABELED:
      visibleLabels = ['unlabeled']
      break
    case LABELED:
      visibleLabels = labels
      break
    default:
      visibleLabels = [section]
      break
  }

  const handleLabelChanged = useCallback(
    label => {
      const selectedImages = getSelectedImages(
        selection,
        groupedImages,
        visibleLabels
      )

      const newActiveLabel = label.trim()
      if (newActiveLabel) {
        if (!labels.includes(newActiveLabel)) {
          syncAction(createLabel, [newActiveLabel])
        }
        syncAction(labelImagesV2, [selectedImages, newActiveLabel, true])
      }

      setSelection([])
    },
    [groupedImages, labels, selection, syncAction, visibleLabels]
  )

  const handleUnlabelImages = useCallback(() => {
    const selectedImages = getSelectedImages(
      selection,
      groupedImages,
      visibleLabels
    )
    syncAction(clearLabels, [selectedImages])
    setSelection([])
  }, [groupedImages, selection, syncAction, visibleLabels])

  const handleDeleteImages = useCallback(() => {
    const selectedImages = getSelectedImages(
      selection,
      groupedImages,
      visibleLabels
    )
    syncAction(deleteImages, [selectedImages])
    setSelection([])
  }, [groupedImages, selection, syncAction, visibleLabels])

  const handleClearSelection = useCallback(() => {
    setSelection([])
  }, [])

  const handleChangeSelection = useCallback(selection => {
    setSelection(selection)
  }, [])

  return (
    <div className={styles.wrapper}>
      <SelectionBar
        selectionCount={selectionCount}
        sections={labels}
        deselectAll={handleClearSelection}
        onItemChosen={handleLabelChanged}
        unlabelImages={handleUnlabelImages}
        deleteImages={handleDeleteImages}
      />
      <EmptySet show={!loading && isEmpty} />
      <GridControllerV2
        className={styles.grid}
        delegate={GridControllerDelegate(
          visibleLabels,
          groupedImages,
          bucket,
          endpoint
        )}
        selection={selection}
        onSelectionChanged={handleChangeSelection}
      />
    </div>
  )
}

const mapStateToProps = () => ({})
const mapDispatchToProps = {
  syncAction
}
export default connect(mapStateToProps, mapDispatchToProps)(GridPanel)
