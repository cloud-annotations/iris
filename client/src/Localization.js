import React, { Component } from 'react'
// import fetchImage from 'api/fetchImage'
import Canvas from './common/Canvas/Canvas'
import ImageTileV2 from './ImageTileV2'
import CrossHair from './CrossHair'
import ToolsPanel from './ToolsPanel'
import HorizontalListController from 'common/HorizontalList/HorizontalListController'

import styles from './Localization.module.css'

export default class App extends Component {
  state = {
    // editing: this.props.collection.images[this.props.currentSection][0],
    selection: 0,
    image: null,
    imageWidth: 0,
    imageHeight: 0,
    bboxes: [],
    labelIndex: 0,
    label: this.props.collection.labels[0],
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
    if (nextProps.currentSection !== this.props.currentSection) {
      this.setState({ selection: 0 })
    }
  }

  // MARK: - Event listeners

  handleKeyDown = event => {
    const charCode = String.fromCharCode(event.which).toLowerCase()
    if (charCode === 'q') {
      event.preventDefault()
      this.setState(prevState => {
        const newIndex =
          (prevState.labelIndex + 1) % this.props.collection.labels.length
        return {
          labelIndex: newIndex,
          label: this.props.collection.labels[newIndex]
        }
      })
    } else if (event.ctrlKey || event.metaKey) {
      this.setState({ mode: 'move' })
    }
  }

  handleKeyUp = e => {
    this.setState({ mode: 'box' })
  }

  handleImageSelected = data => {
    const { collection, currentSection } = this.props
    const { selection } = this.state

    const image = collection.images[currentSection][selection]
    const annotations = collection.annotations[image] || []
    const bboxes = annotations.map(bbox => {
      const color = this.colorFromLabel(bbox.label)
      return { ...bbox, color: color }
    })
    this.setState({
      image: data,
      bboxes: bboxes
    })
  }

  handleChangeSelection = selection => {
    this.setState({ selection: selection })
  }

  colorFromLabel = label => {
    const baseHue = 196
    const spread = 360 / this.props.collection.labels.length
    const index = this.props.collection.labels.reduce((acc, current, i) => {
      if (current === label) {
        return i
      }
      return acc
    }, 0)
    const hue = Math.round((index * spread + baseHue) % 360)
    return `hsl(${hue}, 100%, 50%)`
  }

  handleCoordinatesChanged = (bbox, index) => {
    this.setState(prevState => {
      const bboxes = [...prevState.bboxes]
      bboxes[index] = bbox
      return { bboxes: bboxes }
    })
  }

  handleBoxFinished = (bbox, index) => {
    const { selection } = this.state
    const { onAnnotationAdded, collection, currentSection } = this.props
    this.setState(prevState => {
      const bboxes = [...prevState.bboxes]
      bboxes[index] = bbox
      const image = collection.images[currentSection][selection]
      onAnnotationAdded(image, bboxes)
      return { bboxes: bboxes }
    })
  }

  handleDrawStarted = bbox => {
    this.setState(prevState => {
      bbox.label = this.state.label
      bbox.color = this.colorFromLabel(this.state.label)
      const bboxes = [bbox, ...prevState.bboxes]
      return { bboxes: bboxes }
    })
  }

  handleModeChanged = mode => {
    this.setState({
      mode: mode
    })
  }

  handleLabelChanged = e => {
    this.setState({
      label: e.target.value
    })
  }

  handleImageDimensionChanged = (width, height) => {
    this.setState({
      imageWidth: width,
      imageHeight: height
    })
  }

  render() {
    const { selection } = this.state
    const { collection, currentSection, bucket } = this.props
    const images = collection.images[currentSection]
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
            color={this.colorFromLabel(this.state.label)}
            active={this.state.mode === 'box'}
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
                  mode={this.state.mode}
                  bboxes={this.state.bboxes}
                  image={this.state.image}
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
          mode={this.state.mode}
          label={this.state.label}
          bboxes={this.state.bboxes}
          imageHeight={this.state.imageHeight}
          imageWidth={this.state.imageWidth}
          image={this.state.image}
          onModeChanged={this.handleModeChanged}
          onLabelChanged={this.handleLabelChanged}
        />
        <HorizontalListController
          delegate={HorizontalListControllerDelegate(
            this.handleImageSelected,
            images,
            bucket
          )}
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
