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
import io from 'socket.io-client'

import classification from './classification.png'
import localization from './localization.png'

import styles from './App.module.css'
import './App.css'
import COS from './api/COS'
import { endpointForLocationConstraint } from 'endpoints'

const endpointFinder = bucket => {
  let endpoints = {
    us: 's3.private.us.cloud-object-storage.appdomain.cloud',
    'dal.us': 's3.private.dal.us.cloud-object-storage.appdomain.cloud',
    'wdc.us': 's3.private.wdc.us.cloud-object-storage.appdomain.cloud',
    'sjc.us': 's3.private.sjc.us.cloud-object-storage.appdomain.cloud',
    eu: 's3.private.eu.cloud-object-storage.appdomain.cloud',
    'ams.eu': 's3.private.ams.eu.cloud-object-storage.appdomain.cloud',
    'fra.eu': 's3.private.fra.eu.cloud-object-storage.appdomain.cloud',
    'mil.eu': 's3.private.mil.eu.cloud-object-storage.appdomain.cloud',
    ap: 's3.private.ap.cloud-object-storage.appdomain.cloud',
    'tok.ap': 's3.private.tok.ap.cloud-object-storage.appdomain.cloud',
    'seo.ap': 's3.private.seo.ap.cloud-object-storage.appdomain.cloud',
    'hkg.ap': 's3.private.hkg.ap.cloud-object-storage.appdomain.cloud',
    'us-south': 's3.private.us-south.cloud-object-storage.appdomain.cloud',
    'us-east': 's3.private.us-east.cloud-object-storage.appdomain.cloud',
    'eu-gb': 's3.private.eu-gb.cloud-object-storage.appdomain.cloud',
    'eu-de': 's3.private.eu-de.cloud-object-storage.appdomain.cloud',
    'jp-tok': 's3.private.jp-tok.cloud-object-storage.appdomain.cloud',
    'au-syd': 's3.private.au-syd.cloud-object-storage.appdomain.cloud',
    ams03: 's3.private.ams03.cloud-object-storage.appdomain.cloud',
    che01: 's3.private.che01.cloud-object-storage.appdomain.cloud',
    mel01: 's3.private.mel01.cloud-object-storage.appdomain.cloud',
    osl01: 's3.private.osl01.cloud-object-storage.appdomain.cloud',
    tor01: 's3.private.tor01.cloud-object-storage.appdomain.cloud',
    sao01: 's3.private.sao01.cloud-object-storage.appdomain.cloud',
    seo01: 's3.private.seo01.cloud-object-storage.appdomain.cloud',
    mon01: 's3.private.mon01.cloud-object-storage.appdomain.cloud',
    mex01: 's3.private.mex01.cloud-object-storage.appdomain.cloud',
    sjc04: 's3.private.sjc04.cloud-object-storage.appdomain.cloud',
    mil01: 's3.private.mil01.cloud-object-storage.appdomain.cloud',
    hkg02: 's3.private.hkg02.cloud-object-storage.appdomain.cloud'
  }

  if (process.env.NODE_ENV === 'development') {
    endpoints = {
      us: 's3.us.cloud-object-storage.appdomain.cloud',
      'dal.us': 's3.dal.us.cloud-object-storage.appdomain.cloud',
      'wdc.us': 's3.wdc.us.cloud-object-storage.appdomain.cloud',
      'sjc.us': 's3.sjc.us.cloud-object-storage.appdomain.cloud',
      eu: 's3.eu.cloud-object-storage.appdomain.cloud',
      'ams.eu': 's3.ams.eu.cloud-object-storage.appdomain.cloud',
      'fra.eu': 's3.fra.eu.cloud-object-storage.appdomain.cloud',
      'mil.eu': 's3.mil.eu.cloud-object-storage.appdomain.cloud',
      ap: 's3.ap.cloud-object-storage.appdomain.cloud',
      'tok.ap': 's3.tok.ap.cloud-object-storage.appdomain.cloud',
      'seo.ap': 's3.seo.ap.cloud-object-storage.appdomain.cloud',
      'hkg.ap': 's3.hkg.ap.cloud-object-storage.appdomain.cloud',
      'us-south': 's3.us-south.cloud-object-storage.appdomain.cloud',
      'us-east': 's3.us-east.cloud-object-storage.appdomain.cloud',
      'eu-gb': 's3.eu-gb.cloud-object-storage.appdomain.cloud',
      'eu-de': 's3.eu-de.cloud-object-storage.appdomain.cloud',
      'jp-tok': 's3.jp-tok.cloud-object-storage.appdomain.cloud',
      'au-syd': 's3.au-syd.cloud-object-storage.appdomain.cloud',
      ams03: 's3.ams03.cloud-object-storage.appdomain.cloud',
      che01: 's3.che01.cloud-object-storage.appdomain.cloud',
      mel01: 's3.mel01.cloud-object-storage.appdomain.cloud',
      osl01: 's3.osl01.cloud-object-storage.appdomain.cloud',
      tor01: 's3.tor01.cloud-object-storage.appdomain.cloud',
      sao01: 's3.sao01.cloud-object-storage.appdomain.cloud',
      seo01: 's3.seo01.cloud-object-storage.appdomain.cloud',
      mon01: 's3.mon01.cloud-object-storage.appdomain.cloud',
      mex01: 's3.mex01.cloud-object-storage.appdomain.cloud',
      sjc04: 's3.sjc04.cloud-object-storage.appdomain.cloud',
      mil01: 's3.mil01.cloud-object-storage.appdomain.cloud',
      hkg02: 's3.hkg02.cloud-object-storage.appdomain.cloud'
    }
  }

  const promises = Object.keys(endpoints).map(region =>
    new COS(endpoints[region])
      .bucket(bucket)
      .location()
      .then(() => region)
      .catch(() => false)
  )
  return Promise.all(promises).then(res => {
    for (const i in res) {
      const region = res[i]
      if (region) {
        return endpoints[region]
      }
    }
  })
}

export default class App extends Component {
  constructor(props) {
    super(props)
    const { bucket, location } = props
    const endpoint = endpointForLocationConstraint(location)

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

    const socket = io.connect()

    socket.on('patch', res => {
      const { op, value } = res
      const { annotations, images, labels } = value
      if (annotations) {
        if (op === '+') {
          const collection = this.state.collection.setAnnotation(
            annotations.image,
            [
              ...(this.state.collection.annotations[annotations.image] || []),
              { ...annotations }
            ],
            false
          )
          this.setState({
            collection: collection
          })
          return
        }
        if (op === '-') {
          const newAnnotations = (
            this.state.collection.annotations[annotations.image] || []
          ).filter(
            annotation =>
              !(
                annotation.x === annotations.x &&
                annotation.y === annotations.y &&
                annotation.x2 === annotations.x2 &&
                annotation.y2 === annotations.y2 &&
                annotation.label === annotations.label
              )
          )
          const collection = this.state.collection.setAnnotation(
            annotations.image,
            newAnnotations,
            false
          )
          this.setState({
            collection: collection
          })
          return
        }
      }

      if (images) {
        if (op === '+') {
          const collection = this.state.collection.updateImages(
            images.images,
            false
          )
          this.setState({
            collection: collection
          })
          return
        }

        if (op === '-') {
          const collection = this.state.collection.deleteImages(
            [images.image],
            false
          )
          this.setState({
            collection: collection
          })
          return
        }
      }

      if (labels) {
        if (op === '+') {
          const collection = this.state.collection.addLabel(labels.label, false)
          this.setState({
            collection: collection
          })
          return
        }
        if (op === '-') {
          const collection = this.state.collection.removeLabel(
            labels.label,
            false
          )
          this.setState({
            collection: collection
          })
          return
        }
      }
    })

    this.state = {
      collection: Collection.EMPTY,
      socket: socket,
      choice: 'classification',
      saving: 0,
      loadingVideos: 0,
      loading: true,
      modalActive: false,
      dropzoneActive: false,
      currentSection: ALL_IMAGES
    }
  }

  componentWillUnmount() {
    this.state.socket.close()
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

    //// real-time sandbox.
    this.state.socket.emit('patch', {
      op: '+',
      value: {
        labels: { label: label }
      }
    })
    ////
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

    //// real-time sandbox.
    this.state.socket.emit('patch', {
      op: '-',
      value: {
        labels: { label: label }
      }
    })
    ////
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
    const { bucket } = this.props
    const {
      collection,
      socket,
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

    const { location } = this.props
    const endpoint = endpointForLocationConstraint(location)

    return (
      <div>
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
          style={{
            position: 'fixed',
            webkitTapHighlightColor: 'rgba(0,0,0,0)'
          }}
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

          <Classification
            loading={loading}
            collection={collection}
            currentSection={currentSection}
            onImagesLabeled={this.handleImagesLabeled}
            onImagesUnlabeled={this.handleImagesUnlabeled}
            onImagesDeleted={this.handleImagesDeleted}
            onLabelAdded={this.handleLabelAdded}
            endpoint={endpoint}
            bucket={bucket}
          />
        </Dropzone>
      </div>
    )
  }
}
