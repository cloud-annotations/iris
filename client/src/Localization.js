import React, { Component } from 'react'
import fetchImages from 'api/fetchImages'
import fetchImage from 'api/fetchImage'
import fetchAnnotation from 'api/fetchAnnotation'
import Canvas from 'common/Canvas/Canvas'
import ImageTile from './ImageTile'
import EmptySet from './EmptySet'
import SelectionBar from './SelectionBar'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import './App.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.initializeData()
    this.state = {
      labelList: ['Unlabeled'],
      collection: { Unlabeled: [] },
      selection: null,
      dropzoneActive: false,
      cookieCheckInterval: null,

      image: null,
      bboxes: [],
      label: 'Millenium Falcon',
      mode: 'box'
    }
  }

  initializeData = () => {
    const { bucket, onDataLoaded } = this.props
    fetchImages(localStorage.getItem('loginUrl'), bucket)
      .then(res => {
        onDataLoaded()
        this.setState(res)

        const image = res.collection['Unlabeled'][50]

        fetchAnnotation(localStorage.getItem('loginUrl'), bucket, image)
          .then(res => {
            this.setState(res)
          })
          .catch(error => {
            console.error(error)
          })

        fetchImage(localStorage.getItem('loginUrl'), bucket, image)
          .then(res => {
            this.setState({ image: res.image })
          })
          .catch(error => {
            console.error(error)
          })
      })
      .catch(error => {
        console.error(error)
        if (error.message === 'Forbidden') {
          this.props.history.push('/login')
        }
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
        <Canvas
          mode={this.state.mode}
          bboxes={this.state.bboxes}
          image={this.state.image}
          onDrawStarted={this.handleDrawStarted}
          onCoordinatesChanged={this.handleCoordinatesChanged}
        />
      </div>
    )
  }
}
