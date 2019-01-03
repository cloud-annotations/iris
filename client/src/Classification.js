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

  handleActionLabelImage = () => {}

  handleActionDeleteImages = () => {}

  handleActionCreateLabel = () => {}

  // MARK: - Getter methods

  getSelectionCount = selection => selection.filter(Boolean).length

  getVisibleLabels = (collection, currentSection) => {
    const labels = collection.labels.filter(
      label =>
        currentSection === ALL_IMAGES ||
        currentSection === LABELED ||
        currentSection === label
    )

    if (currentSection === ALL_IMAGES || currentSection === UNLABELED) {
      return [UNLABELED, ...labels]
    }

    return labels
  }

  getIsEmpty = (collection, labels) => {
    return labels.reduce(
      (acc, label) => acc && collection.images[label].length === 0,
      true
    )
  }

  // MARK: - Render method

  render() {
    const { selection } = this.state
    const { collection, currentSection, loading, bucket } = this.props

    const { images } = collection
    const selectionCount = this.getSelectionCount(selection)
    const labels = this.getVisibleLabels(collection, currentSection)
    const isEmpty = this.getIsEmpty(collection, labels)

    return (
      <div>
        <SelectionBar
          selectionCount={selectionCount}
          sections={collection.labels}
          deselectAll={this.handleActionClearSelection}
          labelImages={this.handleActionLabelImage}
          createLabel={this.handleActionCreateLabel}
          deleteImages={this.handleActionDeleteImages}
        />
        <EmptySet show={!loading && isEmpty} />
        <GridControllerV2
          className={styles.grid}
          delegate={GridControllerDelegate(labels, images, bucket)}
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

    numberOfItemsInSection: sectionIndex => {
      return images[labels[sectionIndex]].length
    },
    keyForHeaderInSection: sectionIndex => {
      return labels[sectionIndex]
    },
    titleForHeaderInSection: sectionIndex => {
      return labels[sectionIndex]
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
