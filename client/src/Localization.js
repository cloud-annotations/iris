import React, { Component } from 'react'
import Canvas from './common/Canvas/Canvas'
import ImageTileV2 from './ImageTileV2'
import CrossHair from './CrossHair'
import ToolsPanel from './ToolsPanel'
import HorizontalListController from './common/HorizontalList/HorizontalListController'
import GoogleAnalytics from 'react-ga'
import io from 'socket.io-client'

import { InlineLoading } from 'carbon-components-react'

import styles from './Localization.module.css'
import EmptySet from './EmptySet'

export default class App extends Component {
  state = {
    editing: null,
    image: null,
    imageWidth: 0,
    imageHeight: 0,
    tmpBBoxes: null,
    selectedLabelName: this.props.collection.labels[0],
    mode: 'box'
  }

  // MARK: - Life cycle methods

  componentDidMount() {
    GoogleAnalytics.pageview('localization')
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)

    const socket = io.connect()
    this.setState({ socket: socket }, () => {
      this.setEditingImage(
        this.props.collection.images[this.props.currentSection][0]
      )
    })
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedLabelName } = this.state
    if (nextProps.currentSection !== this.props.currentSection) {
      const { collection, currentSection } = nextProps
      const editing = collection.images[currentSection][0]
      this.setEditingImage(editing)
      // this is pretty lame...
      const target = document.getElementById('HorizontalScroller')
      if (target) {
        target.scrollLeft = 0
      }
    }
    // If the labels were empty but now they aren't add it as the selected.
    if (!selectedLabelName && nextProps.collection.labels[0]) {
      this.setState({
        selectedLabelName: nextProps.collection.labels[0]
      })
    }
    // If you delete the active dropdown label, it thinks it’s still selected.
    if (!nextProps.collection.labels.includes(selectedLabelName)) {
      this.setState({
        selectedLabelName: nextProps.collection.labels[0]
      })
    }
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

  setEditingImage = editing => {
    const { bucket } = this.props
    this.setState({ editing: editing, editorCount: 1 })
    const room = `${localStorage.getItem('resourceId')}:${bucket}:${editing}`
    this.state.socket.emit('join', room)
    this.state.socket.on('theHeadCount', count => {
      this.setState({ editorCount: count })
    })
  }

  handleChangeSelection = selection => {
    const { collection, currentSection } = this.props
    const editing = collection.images[currentSection][selection]
    this.setEditingImage(editing)
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

  handleDeleteImage = () => {
    const { editing } = this.state
    const { onImagesDeleted, collection, currentSection } = this.props
    const images = collection.images[currentSection]
    const currentItem = images.indexOf(editing)
    onImagesDeleted([editing])
    const newSelect = images[currentItem + 1]
    this.setEditingImage(newSelect)
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
      loading,
      editing,
      mode,
      selectedLabelName,
      image,
      imageHeight,
      imageWidth,
      tmpBBoxes
    } = this.state
    const { collection, currentSection, bucket, loadingVideos } = this.props

    const selectedLabelIndex = collection.labels.indexOf(selectedLabelName)

    const selection = collection.images[currentSection].indexOf(editing)

    const bboxes = (tmpBBoxes || collection.annotations[editing] || []).map(
      bbox => {
        const color = this.colorFromLabel(bbox.label)
        return { ...bbox, color: color }
      }
    )

    const maxBubbles = 3
    const othersCount = this.state.editorCount - 1
    const clippedCount = Math.min(othersCount || 0, maxBubbles)
    const overflowCount = othersCount - maxBubbles

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
          <div className={styles.roomHolder}>
            {[...new Array(clippedCount)].map(() => (
              <div className={styles.chatHead}>
                <div>
                  <svg
                    className={styles.chatHeadIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                  >
                    <path d="M16,4a5,5,0,1,1-5,5,5,5,0,0,1,5-5m0-2a7,7,0,1,0,7,7A7,7,0,0,0,16,2Z" />
                    <path d="M26,30H24V25a5,5,0,0,0-5-5H13a5,5,0,0,0-5,5v5H6V25a7,7,0,0,1,7-7h6a7,7,0,0,1,7,7Z" />
                  </svg>
                </div>
              </div>
            ))}
            {overflowCount > 0 && (
              <div className={styles.chatHeadOverflow}>
                <div>+{overflowCount}</div>
              </div>
            )}
          </div>
          {!loading && !editing ? (
            <EmptySet show={!loading && !editing} />
          ) : (
            <CrossHair
              color={this.colorFromLabel(selectedLabelName)}
              active={mode === 'box'}
              children={
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
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
          )}
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
        <div
          className={styles.deleteImageWrapper}
          onClick={this.handleDeleteImage}
        >
          <div>Delete Image</div>
          <svg
            className={styles.deleteSVG}
            width="12"
            height="16"
            viewBox="0 0 12 16"
          >
            <path d="M11 4v11c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V4H0V3h12v1h-1zM2 4v11h8V4H2z" />
            <path d="M4 6h1v7H4zm3 0h1v7H7zM3 1V0h6v1z" />
          </svg>
        </div>

        {loadingVideos > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '4em',
              padding: '1em',
              height: '117px',
              display: 'flex',
              overflow: 'auto',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: '1px solid #dfe3e6',
              borderRight: '1px solid #e7ebee'
            }}
          >
            <InlineLoading success={false} />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: loadingVideos > 0 ? '4em' : '0',
            right: '0'
          }}
        >
          <HorizontalListController
            delegate={HorizontalListControllerDelegate(
              this.handleImageSelected,
              collection.images[currentSection],
              bucket
            )}
            selection={selection}
            onSelectionChanged={this.handleChangeSelection}
          />
        </div>
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
