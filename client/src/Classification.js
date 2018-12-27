import React, { Component } from 'react'
import GridController from 'common/Grid/GridController'
import ImageTile from './ImageTile'
import EmptySet from './EmptySet'
import SelectionBar from './SelectionBar'
import { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import './App.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selection: null,
      dropzoneActive: false,
      cookieCheckInterval: null
    }
  }

  // MARK: - Life cycle methods

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentSection !== this.props.currentSection) {
      this.handleDeselectAll()
    }
  }

  // MARK: - Event listeners

  handleSelectionChanged = selection => {
    this.setState({
      selection: selection
    })
  }

  handleDeselectAll = () => {
    this.setState(prevState => {
      const selection =
        prevState.selection && prevState.selection.map(() => false)
      return {
        selection: selection,
        lastSelected: null
      }
    })
  }

  handleLabelImages = () => {}

  handleDeleteImages = () => {}

  handleCreateLabel = () => {}

  // MARK: - Render method

  render() {
    const selectionCount = this.state.selection
      ? this.state.selection.filter(item => item).length
      : 0

    const visibleLabels = this.props.collection.labels.filter(label => {
      return (
        this.props.currentSection === ALL_IMAGES ||
        (this.props.currentSection === LABELED && label.name !== 'Unlabeled') ||
        (this.props.currentSection === UNLABELED &&
          label.name === 'Unlabeled') ||
        this.props.currentSection === label.name
      )
    })

    const visibleImages = visibleLabels.reduce((acc, label) => {
      acc[label.name] = this.props.collection.images[label.name]
      return acc
    }, {})

    return (
      <div>
        <SelectionBar
          selectionCount={selectionCount}
          sections={this.props.collection.labels}
          deselectAll={this.handleDeselectAll}
          labelImages={this.handleLabelImages}
          createLabel={this.handleCreateLabel}
          deleteImages={this.handleDeleteImages}
        />
        <EmptySet
          show={
            !this.state.loading &&
            // If all labels are empty show empty set.
            visibleLabels.reduce((acc, label) => acc && label.count === 0, true)
          }
        />
        <GridController
          className="Classification-Grid"
          sections={visibleLabels}
          collection={visibleImages}
          selection={this.state.selection}
          onSelectionChanged={this.handleSelectionChanged}
          gridItem={<ImageTile bucket={this.props.bucket} />}
        />
      </div>
    )
  }
}
