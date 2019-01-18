import React, { Component } from 'react'
import Canvas from './common/Canvas/Canvas'
import ImageTileV2 from './ImageTileV2'
import CrossHair from './CrossHair'
import ToolsPanel from './ToolsPanel'
import HorizontalListController from 'common/HorizontalList/HorizontalListController'

import styles from './Localization.module.css'

export default class App extends Component {
  state = {
    editing: this.props.collection.images[this.props.currentSection][0],
    selection: 0,
    image: null,
    imageWidth: 0,
    imageHeight: 0,
    tmpBBoxes: null,
    selectedLabelName: this.props.collection.labels[0],
    mode: 'box'
  }

  // MARK: - Life cycle methods

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedLabelName } = this.state
    if (nextProps.currentSection !== this.props.currentSection) {
      this.setSelection(0, nextProps)
    }
    if (!selectedLabelName && nextProps.collection.labels[0]) {
      this.setState({
        selectedLabelName: nextProps.collection.labels[0]
      })
    }
  }

  // MARK: - Set selection

  // This feels a bit hacky, however we need a way to persist the image we are
  // editing when it's actual section changes.
  setSelection = (selection, props) => {
    const { collection, currentSection } = props
    const editing = collection.images[currentSection][selection]
    this.setState({ editing: editing, selection: selection })
  }

  // MARK: - Event listeners

  handleKeyDown = e => {
    if (document.activeElement.tagName.toLowerCase() === 'input') {
      return
    }

    const char = e.key.toLowerCase()
    if (char === 'q') {
      e.preventDefault()
      this.setState(prevState => {
        const index = this.props.collection.labels.indexOf(
          prevState.selectedLabelName
        )
        const newIndex = (index + 1) % this.props.collection.labels.length
        const labelName = this.props.collection.labels[newIndex]
        return {
          selectedLabelName: labelName
        }
      })
    } else if (e.ctrlKey || e.metaKey) {
      this.setState({ mode: 'move' })
    }
  }

  handleKeyUp = e => {
    const char = e.key.toLowerCase()
    if (char === 'meta' || char === 'control') {
      this.setState({ mode: 'box' })
    }
  }

  handleImageSelected = data => {
    this.setState({
      image: data
    })
  }

  handleChangeSelection = selection => {
    this.setSelection(selection, this.props)
  }

  colorFromLabel = label => {
    const baseHue = 196
    const spread = 360 / this.props.collection.labels.length
    const index = this.props.collection.labels.indexOf(label)
    const hue = Math.round((index * spread + baseHue) % 360)
    return `hsl(${hue}, 100%, 50%)`
  }

  handleCoordinatesChanged = (bbox, index) => {
    const { collection } = this.props
    this.setState(prevState => {
      const { editing, tmpBBoxes } = prevState
      const _bboxes = tmpBBoxes || collection.annotations[editing] || []
      const bboxes = [..._bboxes]
      bboxes[index] = bbox
      return { tmpBBoxes: bboxes }
    })
  }

  handleBoxFinished = (bbox, index) => {
    const { collection, onAnnotationAdded } = this.props
    this.setState(prevState => {
      const { editing, tmpBBoxes } = prevState
      const _bboxes = tmpBBoxes || collection.annotations[editing] || []
      const bboxes = [..._bboxes]
      bboxes[index] = bbox
      onAnnotationAdded(editing, bboxes)
      return { tmpBBoxes: null }
    })
  }

  handleDrawStarted = bbox => {
    const { collection } = this.props
    this.setState(prevState => {
      const { editing, tmpBBoxes, selectedLabelName } = prevState
      bbox.label = selectedLabelName
      bbox.color = this.colorFromLabel(selectedLabelName)
      const _bboxes = tmpBBoxes || collection.annotations[editing] || []
      const bboxes = [bbox, ..._bboxes]
      return { tmpBBoxes: bboxes }
    })
  }

  handleModeChanged = mode => {
    this.setState({
      mode: mode
    })
  }

  handleLabelChanged = labelName => {
    const { collection, onLabelAdded } = this.props
    if (!collection.labels.includes(labelName)) {
      onLabelAdded(labelName)
    }
    // Anticipate the bad name. (we should handle this better)
    if (
      labelName.toLowerCase() !== 'all' &&
      labelName.toLowerCase() !== 'unlabeled' &&
      labelName.toLowerCase() !== 'labeled'
    ) {
      this.setState({ selectedLabelName: labelName })
    }
  }

  handleRelabel = box => {
    // TODO: v3.
  }

  handleDelete = box => {
    const { editing } = this.state
    const { collection, onAnnotationAdded } = this.props

    const bboxes = (collection.annotations[editing] || []).filter(
      bbox =>
        bbox.x !== box.x ||
        bbox.x2 !== box.x2 ||
        bbox.y !== box.y ||
        bbox.y2 !== box.y2 ||
        bbox.label !== box.label
    )
    onAnnotationAdded(editing, bboxes)
  }

  handleImageDimensionChanged = (width, height) => {
    this.setState({
      imageWidth: width,
      imageHeight: height
    })
  }

  render() {
    const {
      editing,
      selection,
      mode,
      selectedLabelName,
      image,
      imageHeight,
      imageWidth,
      tmpBBoxes
    } = this.state
    const { collection, currentSection, bucket } = this.props
    const images = [...collection.images[currentSection]]
    // If our list doesn't include the image we are editing, slip it in there.
    // This makes me queazy, but I can't think of a better approach.
    // the other thing we could do is not sync until they change to a new photo
    // but we could end up with a lot of data loss.
    let skipShimHackBad = false
    if (editing && !images.includes(editing)) {
      images.splice(selection, 0, editing)
      skipShimHackBad = true
    } else if (editing) {
      const index = images.indexOf(editing)
      if (index !== -1) {
        images.splice(index, 1)
      }
      images.splice(selection, 0, editing)
    }

    const selectedLabelIndex = collection.labels.indexOf(selectedLabelName)

    const bboxes = (tmpBBoxes || collection.annotations[editing] || []).map(
      bbox => {
        const color = this.colorFromLabel(bbox.label)
        return { ...bbox, color: color }
      }
    )
    return (
      <div>
        <div
          style={{
            backgroundColor: '#f4f7fb',
            position: 'absolute',
            bottom: '117px',
            left: '0',
            right: '209px',
            top: '0'
          }}
        >
          <CrossHair
            color={this.colorFromLabel(selectedLabelName)}
            active={mode === 'box'}
            children={
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Canvas
                  mode={mode}
                  bboxes={bboxes}
                  image={image}
                  onDrawStarted={this.handleDrawStarted}
                  onCoordinatesChanged={this.handleCoordinatesChanged}
                  onBoxFinished={this.handleBoxFinished}
                  onImageDimensionChanged={this.handleImageDimensionChanged}
                />
              </div>
            }
          />
        </div>
        <ToolsPanel
          labels={this.props.collection.labels}
          mode={mode}
          selectedLabel={selectedLabelIndex}
          bboxes={bboxes}
          imageHeight={imageHeight}
          imageWidth={imageWidth}
          image={image}
          onModeChanged={this.handleModeChanged}
          onLabelChanged={this.handleLabelChanged}
          onRelabel={this.handleRelabel}
          onDelete={this.handleDelete}
        />
        <HorizontalListController
          delegate={HorizontalListControllerDelegate(
            this.handleImageSelected,
            images,
            bucket
          )}
          skipShimHackBad={skipShimHackBad}
          selection={selection}
          onSelectionChanged={this.handleChangeSelection}
        />
      </div>
    )
  }
}

// MARK: - HorizontalListControllerDelegate

const HorizontalListControllerDelegate = (
  handleImageSelected,
  images,
  bucket
) => {
  return {
    numberOfItems: images.length,
    keyForDataSet: images,
    keyForItemAt: index => images[index],
    cellForItemAt: (index, selected) => (
      <ImageTileV2
        index={index}
        onImageSelected={handleImageSelected}
        bucket={bucket}
        selected={selected}
        item={images[index]}
      />
    )
  }
}
