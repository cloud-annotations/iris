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
import COS from './api/COS'

const endpointFinder = bucket => {
  let endpoints = [
    // cross-region
    's3-api.us-geo.objectstorage.service.networklayer.com',
    's3-api.dal-us-geo.objectstorage.service.networklayer.com',
    's3-api.wdc-us-geo.objectstorage.service.networklayer.com',
    's3-api.sjc-us-geo.objectstorage.service.networklayer.com',
    's3.eu-geo.objectstorage.service.networklayer.com',
    's3.ams-eu-geo.objectstorage.service.networklayer.com',
    's3.fra-eu-geo.objectstorage.service.networklayer.com',
    's3.mil-eu-geo.objectstorage.service.networklayer.com',
    's3.ap-geo.objectstorage.service.networklayer.com',
    's3.tok-ap-geo.objectstorage.service.networklayer.com',
    's3.seo-ap-geo.objectstorage.service.networklayer.com',
    's3.hkg-ap-geo.objectstorage.service.networklayer.com',
    // regional
    's3.us-south.objectstorage.service.networklayer.com',
    's3.us-east.objectstorage.service.networklayer.com',
    's3.eu-gb.objectstorage.service.networklayer.com',
    's3.eu-de.objectstorage.service.networklayer.com',
    's3.jp-tok.objectstorage.service.networklayer.com',
    // single-site
    's3.ams03.objectstorage.service.networklayer.com',
    's3.che01.objectstorage.service.networklayer.com',
    's3.mel01.objectstorage.service.networklayer.com',
    's3.osl01.objectstorage.service.networklayer.com',
    's3.tor01.objectstorage.service.networklayer.com',
    's3.sao01.objectstorage.service.networklayer.com'
  ]

  if (process.env.NODE_ENV === 'development') {
    endpoints = [
      // cross-region
      's3-api.us-geo.objectstorage.softlayer.net',
      's3-api.dal-us-geo.objectstorage.softlayer.net',
      's3-api.wdc-us-geo.objectstorage.softlayer.net',
      's3-api.sjc-us-geo.objectstorage.softlayer.net',
      's3.eu-geo.objectstorage.softlayer.net',
      's3.ams-eu-geo.objectstorage.softlayer.net',
      's3.fra-eu-geo.objectstorage.softlayer.net',
      's3.mil-eu-geo.objectstorage.softlayer.net',
      's3.ap-geo.objectstorage.softlayer.net',
      's3.tok-ap-geo.objectstorage.softlayer.net',
      's3.seo-ap-geo.objectstorage.softlayer.net',
      's3.hkg-ap-geo.objectstorage.softlayer.net',
      // regional
      's3.us-south.objectstorage.softlayer.net',
      's3.us-east.objectstorage.softlayer.net',
      's3.eu-gb.objectstorage.softlayer.net',
      's3.eu-de.objectstorage.softlayer.net',
      's3.jp-tok.objectstorage.softlayer.net',
      // single-site
      's3.ams03.objectstorage.softlayer.net',
      's3.che01.objectstorage.softlayer.net',
      's3.mel01.objectstorage.softlayer.net',
      's3.osl01.objectstorage.softlayer.net',
      's3.tor01.objectstorage.softlayer.net',
      's3.sao01.objectstorage.softlayer.net'
    ]
  }
  const promises = endpoints.map(endpoint =>
    new COS(endpoint)
      .bucket(bucket)
      .location()
      .then(() => true)
      .catch(() => false)
  )
  return Promise.all(promises).then(res => {
    for (const i in res) {
      if (res[i]) {
        return endpoints[i]
      }
    }
  })
}

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

        if (error.message !== 'Forbidden') {
          const doSearch = window.confirm(
            `Unable to find the bucket "${bucket}" in this region. Would you like to search other regions?`
          )
          if (doSearch) {
            endpointFinder(bucket).then(realEndpoint => {
              if (!realEndpoint) {
                alert("Couldn't find bucket.")
                history.push('/')
                return
              }
              const switchEndpoint = window.confirm(
                `Bucket "${bucket}" found in region "${realEndpoint}". Would you like to switch to this region?`
              )
              if (switchEndpoint) {
                localStorage.setItem('loginUrl', realEndpoint)
                // This is a hacky way to handle this, but the page won't reload
                // unless we switch to another page first.
                history.push('/')
                history.push(bucket)
                return
              }
              history.push('/')
              return
            })
          } else {
            history.push('/')
            return
          }
        }
      })

    this.state = {
      collection: Collection.EMPTY,
      choice: 'classification',
      saving: 0,
      loadingVideos: 0,
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
                this.setState(prevState => ({
                  saving: prevState.saving + 1,
                  loadingVideos: prevState.loadingVideos + 1
                }))
                return newCollection.addVideo(
                  video,
                  FPS,
                  newerCollection => {
                    this.setState({ collection: newerCollection }, () => {
                      resolve(this.state.collection)
                      this.setState(prevState => ({
                        loadingVideos: prevState.loadingVideos - 1
                      }))
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
      currentSection,
      loadingVideos
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
                    loadingVideos={loadingVideos}
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
