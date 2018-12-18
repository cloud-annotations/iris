import React, { Component } from 'react'
import fetchImages from 'api/fetchImages'
import fetchImage from 'api/fetchImage'
import fetchAnnotation from 'api/fetchAnnotation'
import Canvas from 'common/Canvas/Canvas'
import ImageTileV2 from './ImageTileV2'
import EmptySet from './EmptySet'
import SelectionBar from './SelectionBar'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import './App.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.horizontalScrollRef = React.createRef()
    this.initializeData()
    this.state = {
      labelList: ['Unlabeled'],
      collection: { Unlabeled: [] },
      selection: 0,
      dropzoneActive: false,
      cookieCheckInterval: null,
      image: null,
      bboxes: [],
      label: 'Millennium Falcon',
      mode: 'box'
    }
  }

  componentDidMount() {
    document.addEventListener('mousewheel', this.blockSwipeBack, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousewheel', this.blockSwipeBack)
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

  initializeData = () => {
    const { bucket, onDataLoaded } = this.props
    fetchImages(localStorage.getItem('loginUrl'), bucket)
      .then(res => {
        onDataLoaded()
        const image = res.collection['Unlabeled'][0]
        this.loadForImage(bucket, image)
        this.setState(res)
      })
      .catch(error => {
        console.error(error)
        if (error.message === 'Forbidden') {
          this.props.history.push('/login')
        }
      })
  }

  loadForImage = (bucket, image) => {
    const annotationPromise = fetchAnnotation(
      localStorage.getItem('loginUrl'),
      bucket,
      image
    )
    const imagePromise = fetchImage(
      localStorage.getItem('loginUrl'),
      bucket,
      image
    )

    Promise.all([imagePromise, annotationPromise])
      .then(res => {
        console.log(res)
        const bboxes = res[1].bboxes.map(bbox => {
          const color = this.colorFromLabel(bbox.label)
          bbox.color = color
          return bbox
        })
        this.setState({ ...res[0], bboxes: bboxes })
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
    const { labelList } = this.state
    const baseHue = 196
    const spread = 360 / labelList.length
    const index = labelList.indexOf(label)
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

  render() {
    return (
      <div>
        <div
          style={{
            position: 'absolute',
            bottom: '117px',
            left: '0',
            right: '0',
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
          />
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
          {this.state.collection['Unlabeled'].map((item, i) => {
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
