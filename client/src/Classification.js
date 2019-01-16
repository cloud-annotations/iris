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
      this.handleActionClearSelection()
    }
  }

  // MARK: - Event listeners

  handleChangeSelection = selection => {
    this.setState({ selection: selection })
  }

  handleActionClearSelection = () => {
    this.handleChangeSelection([])
  }

  handleActionLabelImage = label => {
    // const { selection } = this.state
    // const { onAnnotationAdded, collection, currentSection } = this.props
    // onAnnotationAdded(collection.images[currentSection][selection], label)
  }

  handleActionDeleteImages = () => {}

  handleActionCreateLabel = () => {}

  // MARK: - Getter methods

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
          deselectAll={this.handleActionClearSelection}
          labelImages={this.handleActionLabelImage}
          createLabel={this.handleActionCreateLabel}
          deleteImages={this.handleActionDeleteImages}
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
