import React, { Component } from 'react'
import BucketBar from './BucketBar'
import Classification from './Classification'
import CardChoice from './CardChoice'
import Localization from './Localization'
import Collection from './Collection'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import { Loading, Modal } from 'carbon-components-react'
import Dropzone from 'react-dropzone'
import history from './history'
import { getDataTransferItems } from './Utils'

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
        const collection = new Collection(
          type,
          labels,
          images,
          annotations,
          endpoint,
          bucket
        )
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
      saving: 0,
      loading: true,
      modalActive: false,
      dropzoneActive: false,
      currentSection: ALL_IMAGES
    }
  }

  uploadFiles = fileList => {
    const FPS = 3
    const images = fileList.filter(file => file.type.startsWith('image/'))
    const videos = fileList.filter(file => file.type.startsWith('video/'))
    const { collection } = this.state
    new Promise((resolve, _) => {
      if (collection.type === 'localization') {
        videos
          .reduce((acc, video) => {
            return new Promise((resolve, _) => {
              acc.then(newCollection => {
                this.setState(prevState => ({ saving: prevState.saving + 1 }))
                return newCollection.addVideo(
                  video,
                  FPS,
                  newerCollection => {
                    this.setState({ collection: newerCollection }, () => {
                      resolve(this.state.collection)
                    })
                  },
                  this.handleSyncComplete
                )
              })
            })
          }, Promise.resolve(collection))
          .then(() => {
            resolve()
          })
      } else {
        resolve()
      }
    }).then(() => {
      this.setState(prevState => {
        const { currentSection, collection } = prevState

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
          images,
          label,
          intermediateCollection => {
            this.setState({ collection: intermediateCollection })
          },
          this.handleSyncComplete
        )
        return { saving: prevState.saving + 1, collection: tmpCollection }
      })
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
        return { saving: prevState.saving + 1, collection: collection }
      } catch (error) {
        console.error(error)
        if (error.message === 'Forbidden') {
          history.push('/login')
        }
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
        prevState.currentSection === label
          ? ALL_IMAGES
          : prevState.currentSection
      return {
        saving: prevState.saving + 1,
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
        return { saving: prevState.saving + 1, collection: collection }
      } catch (error) {
        console.error(error)
        if (error.message === 'Forbidden') {
          history.push('/login')
        }
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
        return { saving: prevState.saving + 1, collection: collection }
      } catch (error) {
        console.error(error)
        if (error.message === 'Forbidden') {
          history.push('/login')
        }
      }
    })
  }

  handleImagesUnlabeled = images => {
    this.setState(prevState => {
      const collection = prevState.collection.unlabelImages(
        images,
        this.handleSyncComplete
      )
      return { saving: prevState.saving + 1, collection: collection }
    })
  }

  handleImagesDeleted = images => {
    this.setState(prevState => {
      const collection = prevState.collection.deleteImages(
        images,
        this.handleSyncComplete
      )
      return { saving: prevState.saving + 1, collection: collection }
    })
  }

  handleDataLoaded = () => {
    this.setState({ loading: false })
  }

  handleSyncComplete = () => {
    this.setState(prevState => ({ saving: prevState.saving - 1 }))
  }

  handleChoiceMade = () => {
    this.setState(prevState => {
      const collection = prevState.collection.setType(
        prevState.choice,
        this.handleSyncComplete
      )
      return {
        saving: prevState.saving + 1,
        collection: collection,
        modalActive: false
      }
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
      saving,
      currentSection
    } = this.state

    const sections = collection.labels.map(label => ({
      name: label,
      count: collection.images[label].length
    }))

    const accept =
      collection.type === 'localization' ? 'image/*,video/*' : 'image/*'

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
          saved={saving === 0}
          bucket={bucket}
          accept={accept}
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
          accept={accept}
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
                    loading={loading}
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
                    onImagesDeleted={this.handleImagesDeleted}
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
