import React, { Component } from 'react'
import BucketBar from './BucketBar'
import Classification from './Classification'
import CardChoice from './CardChoice'
import Localization from './Localization'
import Collection from './Collection'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import { Loading, Modal } from 'carbon-components-react'
import Dropzone from 'react-dropzone'
import GoogleAnalytics from 'react-ga'
import history from './history'
import { getDataTransferItems, readFile } from './Utils'

import classification from './classification.png'
import localization from './localization.png'

import styles from './App.module.css'
import './App.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    const { bucket } = props.match.params
    const endpoint = localStorage.getItem('loginUrl')

    Collection.load(endpoint, bucket)
      .then(({ type, labels, images, annotations }) => {
        const collection = new Collection(type, labels, images, annotations)
        console.log(JSON.stringify(collection))
        if (collection.type === undefined) {
          this.setState({
            collection: collection,
            loading: false,
            modalActive: true
          })
        } else {
          this.setState({
            collection: collection,
            loading: false
          })
        }
      })
      .catch(error => {
        if (error.message === 'Forbidden') {
          history.push('/login')
        }
        console.error(error)
      })

    this.state = {
      collection: Collection.EMPTY,
      choice: 'classification',
      saved: true,
      loading: true,
      modalActive: false,
      dropzoneActive: false,
      currentSection: ALL_IMAGES
    }
  }

  componentDidMount() {
    GoogleAnalytics.pageview('annotations')
  }

  uploadFiles = fileList => {
    this.setState(prevState => {
      const { currentSection, collection } = prevState
      if (
        collection.type === 'localization' &&
        fileList[0].type.startsWith('video/')
      ) {
        const FPS = 3
        collection.addVideo(
          fileList[0],
          FPS,
          intermediateCollection => {
            this.setState({ collection: intermediateCollection })
          },
          this.handleSyncComplete
        )
        return { saved: false }
      }

      // If a label tab is selected, images need to be labeled as such.
      const label = (() => {
        switch (currentSection) {
          case UNLABELED:
          case LABELED:
          case ALL_IMAGES:
            return undefined
          default:
            return currentSection
        }
      })()

      const tmpCollection = collection.addImages(
        fileList,
        label,
        intermediateCollection => {
          this.setState({ collection: intermediateCollection })
        },
        this.handleSyncComplete
      )
      return { saved: false, collection: tmpCollection }
    })
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

  handleLabelAdded = label => {
    this.setState(prevState => {
      try {
        const collection = prevState.collection.addLabel(
          label,
          this.handleSyncComplete
        )
        return { saved: false, collection: collection }
      } catch (error) {
        if (error.message === 'Forbidden') {
          history.push('/login')
        }
        console.error(error)
      }
    })
  }

  handleLabelDeleted = label => {
    this.setState(prevState => {
      const collection = prevState.collection.removeLabel(
        label,
        this.handleSyncComplete
      )
      // Quick fix for deleting the active label.
      const currentSection =
        prevState.currentSection === label ? ALL_IMAGES : label
      return {
        saved: false,
        collection: collection,
        currentSection: currentSection
      }
    })
  }

  handleAnnotationAdded = (image, boxes) => {
    this.setState(prevState => {
      try {
        const collection = prevState.collection.setAnnotation(
          image,
          boxes,
          this.handleSyncComplete
        )
        return { saved: false, collection: collection }
      } catch (error) {
        if (error.message === 'Forbidden') {
          history.push('/login')
        }
        console.error(error)
      }
    })
  }

  handleImagesLabeled = (images, label) => {
    this.setState(prevState => {
      try {
        const collection = prevState.collection.labelImages(
          images,
          label,
          this.handleSyncComplete
        )
        return { saved: false, collection: collection }
      } catch (error) {
        if (error.message === 'Forbidden') {
          history.push('/login')
        }
        console.error(error)
      }
    })
  }

  handleImagesUnlabeled = images => {
    this.setState(prevState => {
      const collection = prevState.collection.unlabelImages(
        images,
        this.handleSyncComplete
      )
      return { saved: false, collection: collection }
    })
  }

  handleDataLoaded = () => {
    this.setState({ loading: false })
  }

  handleSyncComplete = () => {
    this.setState({ saved: true })
  }

  handleChoiceMade = () => {
    this.setState(prevState => {
      const collection = prevState.collection.setType(
        prevState.choice,
        this.handleSyncComplete
      )
      return { saved: false, collection: collection, modalActive: false }
    })
  }

  handleCloseModal = () => {
    history.push('/')
  }

  handleChooseClassification = () => {
    this.setState({ choice: 'classification' })
  }

  handleChooseLocalization = () => {
    this.setState({ choice: 'localization' })
  }

  render() {
    const { bucket } = this.props.match.params
    const {
      collection,
      dropzoneActive,
      loading,
      saved,
      currentSection
    } = this.state

    const sections = collection.labels.map(label => ({
      name: label,
      count: collection.images[label].length
    }))

    return (
      <div>
        <Modal
          className="Buckets-Modal-TextInput-Wrapper"
          open={this.state.modalActive}
          shouldSubmitOnEnter={true}
          modalHeading="Annotation type"
          primaryButtonText="Confirm"
          secondaryButtonText="Cancel"
          onRequestClose={this.handleCloseModal}
          onRequestSubmit={this.handleChoiceMade}
          onSecondarySubmit={this.handleCloseModal}
        >
          <div className={styles.choiceWrapper}>
            <CardChoice
              onClick={this.handleChooseClassification}
              selected={this.state.choice === 'classification'}
              title="Classification"
              image={classification}
            />
            <CardChoice
              onClick={this.handleChooseLocalization}
              selected={this.state.choice === 'localization'}
              title="Localization"
              image={localization}
            />
          </div>
        </Modal>

        <BucketBar
          saved={saved}
          bucket={bucket}
          onFileChosen={this.handleFileChosen}
        />
        <Sidebar
          currentSection={currentSection}
          allImagesCount={collection.images.all.length}
          labeledCount={collection.images.labeled.length}
          unlabeledCount={collection.images.unlabeled.length}
          sectionList={sections}
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
          {(() => {
            switch (collection.type) {
              case 'localization':
                return (
                  <Localization
                    collection={collection}
                    currentSection={currentSection}
                    onAnnotationAdded={this.handleAnnotationAdded}
                    onLabelAdded={this.handleLabelAdded}
                    bucket={bucket}
                  />
                )
              case 'classification':
                return (
                  <Classification
                    loading={loading}
                    collection={collection}
                    currentSection={currentSection}
                    onImagesLabeled={this.handleImagesLabeled}
                    onImagesUnlabeled={this.handleImagesUnlabeled}
                    onLabelAdded={this.handleLabelAdded}
                    bucket={bucket}
                  />
                )
              default:
                return null
            }
          })()}
        </Dropzone>
      </div>
    )
  }
}
