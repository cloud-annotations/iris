import React, { Component } from 'react'
import BucketBar from './BucketBar'
import EmptySet from './EmptySet'
import putImages from 'api/putImages'
import Classification from './Classification'
import Localization from './Localization'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import SelectionBar from './SelectionBar'
import localforage from 'localforage'
import { Loading } from 'carbon-components-react'
import Dropzone from 'react-dropzone'
import GoogleAnalytics from 'react-ga'
import {
  generateUUID,
  getDataTransferItems,
  readFile,
  shrinkImage,
  namedCanvasToFile
} from './Utils'
import './App.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saved: true,
      loading: true,
      dropzoneActive: false,
      currentSection: ALL_IMAGES,
      sectionList: [ALL_IMAGES, UNLABELED, LABELED],
      sectionCount: { [ALL_IMAGES]: 0, [UNLABELED]: 0, [LABELED]: 0 }
    }
  }

  componentDidMount() {
    GoogleAnalytics.pageview('annotations')
  }

  uploadFiles = fileList => {
    const { bucket } = this.props.match.params

    // If a label tab is selected, images need to be labeled as such.
    const label =
      this.state.currentSection === UNLABELED ||
      this.state.currentSection === LABELED ||
      this.state.currentSection === ALL_IMAGES
        ? 'Unlabeled'
        : this.state.currentSection

    // Inject tmp names so empty tiles show while the actual images are loading.
    this.setState(prevState => {
      const collection = { ...prevState.collection }

      // We need a unique name to use as a key so react doesn't shit the bed.
      const tmp = Array.apply(null, Array(fileList.length)).map(
        () => `${generateUUID()}.tmp`
      )

      collection[label] = [...tmp, ...collection[label]]

      const selection = Object.keys(collection).reduce((acc, key) => {
        return [...acc, ...collection[key].map(() => false)]
      }, [])

      return {
        collection: collection,
        selection: selection
      }
    })

    const readFiles = fileList.map(file =>
      readFile(file)
        .then(image => shrinkImage(image))
        .then(canvas => {
          const name = `${generateUUID()}.jpg`
          const dataURL = canvas.toDataURL('image/jpeg')
          // We don't care when this finishes, so it can break of on it's own.
          localforage.setItem(name, dataURL).then(() => {
            this.setState(prevState => {
              const collection = { ...prevState.collection }
              const index = collection[label].findIndex(item =>
                item.endsWith('.tmp')
              )
              collection[label][index] = name
              return {
                collection: collection
              }
            })
          })
          return { canvas: canvas, name: name }
        })
        .then(namedCanvas => namedCanvasToFile(namedCanvas))
    )

    const uploadRequest = Promise.all(readFiles)
      .then(files => {
        return putImages(localStorage.getItem('loginUrl'), bucket, files)
      })
      .catch(error => {
        console.error(error)
      })

    this.annotationsToCsv()
    this.changeRequest(uploadRequest)
  }

  handleDragEnter = () => {
    this.setState({ dropzoneActive: true })
  }

  handleDragLeave = () => {
    this.setState({ dropzoneActive: false })
  }

  handleDrop = files => {
    this.uploadFiles(files)
    this.setState({ dropzoneActive: false })
  }

  handleFileChosen = e => {
    const fileList = getDataTransferItems(e)
    this.uploadFiles(fileList)
  }

  handleSectionChanged = label => {
    this.setState({ currentSection: label })
  }

  handleLabelAdded = () => {}

  handleLabelDeleted = () => {}

  handleDataLoaded = () => {
    this.setState({ loading: false })
  }

  render() {
    const { bucket } = this.props.match.params
    const {
      dropzoneActive,
      loading,
      saved,
      sectionList,
      sectionCount,
      currentSection
    } = this.state
    return (
      <div>
        <BucketBar
          saved={saved}
          bucket={bucket}
          onFileChosen={this.handleFileChosen}
        />
        <Sidebar
          currentSection={currentSection}
          sectionList={sectionList}
          sectionCount={sectionCount}
          onSectionChanged={this.handleSectionChanged}
          onLabelAdded={this.handleLabelAdded}
          onLabelDeleted={this.handleLabelDeleted}
        />
        <Dropzone
          disableClick
          className="App-Parent"
          style={{ position: 'fixed' }}
          accept="image/*"
          onDrop={this.handleDrop}
          onDragEnter={this.handleDragEnter}
          onDragLeave={this.handleDragLeave}
        >
          <Loading active={loading} />
          <div className={`App-DropTarget ${dropzoneActive ? '--Active' : ''}`}>
            <div className="App-DropTarget-outline">
              <div className="App-DropTarget-text">
                Drop to upload your images
              </div>
            </div>
          </div>

          {/* Depending on which bucket type */}
          <Localization
            currentSection={currentSection}
            bucket={bucket}
            onDataLoaded={this.handleDataLoaded}
          />
        </Dropzone>
      </div>
    )
  }
}
