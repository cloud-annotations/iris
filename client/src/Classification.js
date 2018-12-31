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

  getVisible = (collection, currentSection) => {
    const labels = collection.labels.filter(
      label =>
        currentSection === ALL_IMAGES ||
        (currentSection === LABELED && label.name !== 'Unlabeled') ||
        (currentSection === UNLABELED && label.name === 'Unlabeled') ||
        currentSection === label.name
    )
    const images = labels.reduce((acc, label) => {
      acc[label.name] = collection.images[label.name]
      return acc
    }, {})
    return [labels, images]
  }

  getIsEmpty = labels =>
    labels.reduce((acc, label) => acc && label.count === 0, true)

  // MARK: - GridControllerDelegate

  gridControllerDelegate = () => {
    const { collection, currentSection, bucket } = this.props
    const [labels, images] = this.getVisible(collection, currentSection)
    return {
      numberOfSections: labels.length,
      numberOfItemsInSection: section => {
        return labels[section].count
      },
      titleForHeaderInSection: section => {
        return labels[section].name
      },
      cellForItemAt: (sectionIndex, index, selected) => {
        const section = labels[sectionIndex].name
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

  // MARK: - Render method

  render() {
    const { selection } = this.state
    const { collection, currentSection, loading } = this.props

    const selectionCount = this.getSelectionCount(selection)
    const [labels, images] = this.getVisible(collection, currentSection)
    const isEmpty = this.getIsEmpty(labels)

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
          delegate={this.gridControllerDelegate()}
          selection={selection}
          onSelectionChanged={this.handleChangeSelection}
        />
      </div>
    )
  }
}
