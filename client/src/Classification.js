import React, { Component } from 'react'
import GridControllerV2 from 'common/Grid/GridControllerV2'
import ImageTile from './ImageTile'
import EmptySet from './EmptySet'
import SelectionBar from './SelectionBar'
import { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import styles from './Classification.module.css'

export default class Classification extends Component {
  state = {
    selection: []
  }

  // MARK: - Life cycle methods

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentSection !== this.props.currentSection) {
      this.handleClearSelection()
    }
  }

  // MARK: - Event listeners

  handleChangeSelection = selection => {
    this.setState({ selection: selection })
  }

  handleClearSelection = () => {
    this.handleChangeSelection([])
  }

  handleLabelChanged = labelName => {
    const { selection } = this.state
    const { collection, currentSection, onImagesLabeled } = this.props
    const images = this.getSelectedImages(selection, collection, currentSection)
    onImagesLabeled(images, labelName)
    this.handleClearSelection()
  }

  handleUnlabelImages = () => {
    const { selection } = this.state
    const { collection, currentSection, onImagesUnlabeled } = this.props
    const images = this.getSelectedImages(selection, collection, currentSection)
    onImagesUnlabeled(images)
    this.handleClearSelection()
  }

  handleDeleteImages = () => {
    alert('todo')
  }

  // MARK: - Getter methods

  getSelectedImages = (selection, collection, currentSection) => {
    const visibleLabels = this.getVisibleLabels(
      collection.labels,
      currentSection
    )
    const visibleImages = visibleLabels.reduce((acc, label) => {
      return [...acc, ...collection.images[label]]
    }, [])
    return visibleImages.filter((_, i) => selection[i])
  }

  getSelectionCount = selection => selection.filter(Boolean).length

  getVisibleLabels = (labels, currentSection) => {
    switch (currentSection) {
      case ALL_IMAGES:
        return [UNLABELED, ...labels]
      case LABELED:
        return labels
      case UNLABELED:
        return [UNLABELED]
      default:
        return [currentSection]
    }
  }

  getIsEmpty = (images, labels) =>
    labels.reduce((acc, label) => acc && images[label].length === 0, true)

  // MARK: - Render method

  render() {
    const { selection } = this.state
    const { collection, currentSection, loading, bucket } = this.props

    const { images, labels } = collection
    const selectionCount = this.getSelectionCount(selection)
    const visibleLabels = this.getVisibleLabels(labels, currentSection)
    const isEmpty = this.getIsEmpty(images, visibleLabels)

    return (
      <div>
        <SelectionBar
          selectionCount={selectionCount}
          sections={visibleLabels}
          deselectAll={this.handleClearSelection}
          onItemChosen={this.handleLabelChanged}
          unlabelImages={this.handleUnlabelImages}
          deleteImages={this.handleDeleteImages}
        />
        <EmptySet show={!loading && isEmpty} />
        <GridControllerV2
          className={styles.grid}
          delegate={GridControllerDelegate(visibleLabels, images, bucket)}
          selection={selection}
          onSelectionChanged={this.handleChangeSelection}
        />
      </div>
    )
  }
}

// MARK: - GridControllerDelegate

const GridControllerDelegate = (labels, images, bucket) => {
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
          bucket={bucket}
          selected={selected}
          item={images[section][index]}
        />
      )
    }
  }
}
