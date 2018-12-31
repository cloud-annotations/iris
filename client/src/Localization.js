import React, { Component } from 'react'
import fetchImage from 'api/fetchImage'
import Canvas from 'common/Canvas/Canvas'
import ImageTileV2 from './ImageTileV2'

import styles from './Localization.module.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.horizontalScrollRef = React.createRef()
    this.state = {
      selection: 0,
      image: null,
      imageWidth: 0,
      imageHeight: 0,
      bboxes: [],
      label: props.collection.labels[0].name,
      mode: 'box'
    }
  }

  componentDidMount() {
    document.addEventListener('mousewheel', this.blockSwipeBack, false)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('mousewheel', this.blockSwipeBack)
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = e => {
    if (e.which === 39) {
      e.preventDefault()

      this.setState(
        prevState => ({
          selection: prevState.selection + 1
        }),
        () => {
          this.loadForImage(
            this.props.bucket,
            this.props.collection.images.all[this.state.selection]
          )
        }
      )
    } else if (e.which === 37) {
      e.preventDefault()
      this.setState(
        prevState => ({
          selection: prevState.selection - 1
        }),
        () => {
          this.loadForImage(
            this.props.bucket,
            this.props.collection.images.all[this.state.selection]
          )
        }
      )
    }
  }

  blockSwipeBack = e => {
    e.stopPropagation()
    const scrollElement = this.horizontalScrollRef.current
    if (!scrollElement.contains(e.target)) {
      return
    }

    const max = scrollElement.scrollWidth - scrollElement.offsetWidth
    const scrollPosition = scrollElement.scrollLeft + e.deltaX

    if (scrollPosition < 0 || scrollPosition > max) {
      e.preventDefault()
      scrollElement.scrollLeft = Math.max(0, Math.min(max, scrollPosition))
    }
  }

  loadForImage = (bucket, image) => {
    const imagePromise = fetchImage(
      localStorage.getItem('loginUrl'),
      bucket,
      image
    )
      .then(res => {
        const bboxes = this.props.collection.annotations[image].bboxes.map(
          bbox => {
            const color = this.colorFromLabel(bbox.label)
            return { ...bbox, color: color }
          }
        )
        this.setState({
          ...res,
          bboxes: bboxes
        })
      })
      .catch(error => {
        console.error(error)
      })
  }

  onSelectionChanged = selection => {
    this.setState({
      selection: selection
    })
  }

  colorFromLabel = label => {
    const baseHue = 196
    const spread = 360 / this.props.collection.labels.length
    const index = this.props.collection.labels.reduce((acc, current, i) => {
      if (current.name === label) {
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
    return (
      <div>
        <div
          style={{
            position: 'absolute',
            bottom: '117px',
            left: '0',
            right: '209px',
            top: '0',
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
            onImageDimensionChanged={this.handleImageDimensionChanged}
          />
        </div>
        <div className={styles.sidebar}>
          <div>Tools</div>
          <div className={styles.tools}>
            <div
              className={
                this.state.mode === 'move'
                  ? styles.activeToolWrapper
                  : styles.toolWrapper
              }
              onClick={() => {
                this.handleModeChanged('move')
              }}
            >
              <svg
                className={styles.move}
                width="20"
                height="20"
                viewBox="0 0 40 40"
              >
                <path d="M19,11h2V29H19V11Zm-8,8H29v2H11V19ZM21,35H19l-4-6H25ZM35,19v2l-6,4V15ZM5,21V19l6-4V25ZM19,5h2l4,6H15Z" />
              </svg>
            </div>
            <div
              className={
                this.state.mode === 'box'
                  ? styles.activeToolWrapper
                  : styles.toolWrapper
              }
              onClick={() => {
                this.handleModeChanged('box')
              }}
            >
              <svg
                className={styles.box}
                width="20"
                height="20"
                viewBox="0 0 40 40"
              >
                <rect x="4" y="8" width="32" height="24" />
              </svg>
            </div>
          </div>
          <div>{`Label: ${this.state.label}`}</div>
          {this.props.collection.labels.map(label => (
            <button value={label.name} onClick={this.handleLabelChanged}>
              {label.name}
            </button>
          ))}
          {this.state.bboxes
            .sort((a, b) => a.label.toLowerCase() < b.label.toLowerCase())
            .map(box => {
              const imageHeight = this.state.imageHeight
              const imageWidth = this.state.imageWidth

              const cropHeight = 20
              const cropWidth = 30

              const scale = cropWidth / ((box.x2 - box.x) * imageWidth)
              const objHeight = scale * (box.y2 - box.y) * imageHeight
              const centerOffset = (cropHeight - objHeight) / 2
              const xOffset = -box.x * scale * imageWidth
              const yOffset = -box.y * scale * imageHeight
              const backgroundSize = scale * (100 / cropWidth) * imageWidth

              return (
                <div>
                  <div
                    style={{
                      backgroundImage: `url(${this.state.image})`,
                      height: `${cropHeight}px`,
                      width: `${cropWidth}px`,
                      backgroundPosition: `${xOffset}px ${yOffset +
                        centerOffset}px`,
                      backgroundSize: `${backgroundSize}%`
                    }}
                  />
                  <div>{box.label}</div>
                </div>
              )
            })}
        </div>
        <div
          ref={this.horizontalScrollRef}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '117px',
            display: 'flex',
            overflow: 'auto',
            alignItems: 'center',
            borderTop: '1px solid #dfe3e6'
          }}
        >
          {this.props.collection.images.all.map((item, i) => {
            return (
              <div
                style={{ height: '80px', margin: '0 8px' }}
                onClick={() => {
                  this.loadForImage(this.props.bucket, item)
                  this.setState({ selection: i })
                }}
              >
                <ImageTileV2
                  selected={this.state.selection === i}
                  bucket={this.props.bucket}
                  item={item}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}