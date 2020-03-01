import React, { useEffect, useState, useCallback } from 'react'
import { connect } from 'react-redux'
import { Loading } from 'carbon-components-react'
import queryString from 'query-string'
import Dropzone from 'react-dropzone'

import history from 'globalHistory'
import {
  loadCollection,
  clearCollection,
  setCollectionType,
  setCollection,
  uploadImages,
  syncAction,
  bootstrap
} from 'redux/collection'
import { setBucket } from 'redux/editor'
import Localization from './Localization/Localization'
import { locationFinder } from './endpointFinder'
import ChooseBucketModal from './ChooseBucketModal'
import AppBar from './AppBar'
import AppBarLayout from './AppBarLayout'

import styles from './App.module.css'
import { convertToJpeg, videoToJpegs, checkLoginStatus } from 'Utils'
import ClassificationV2 from './ClassificationV2/Classification'
import { importDataset } from 'dataset-utils'

const generateFiles = async (images, videos) => {
  const imageFiles = images.map(
    async image =>
      await convertToJpeg(image, {
        maxWidth: window.MAX_IMAGE_WIDTH,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        scaleMode: window.IMAGE_SCALE_MODE
      })
  )
  const videoFiles = videos.map(
    async video =>
      await videoToJpegs(video, {
        fps: window.FPS,
        maxWidth: window.MAX_IMAGE_WIDTH,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        scaleMode: window.IMAGE_SCALE_MODE
      })
  )
  return (await Promise.all([...imageFiles, ...videoFiles])).flat()
}

const AnnotationPanel = ({ bucket, location, type }) => {
  switch (type) {
    case 'classification':
      // Using legacy app.
      return <ClassificationV2 location={location} bucket={bucket} />
    case 'localization':
      return <Localization location={location} bucket={bucket} />
    default:
      return null
  }
}

const App = ({
  match: {
    params: { bucket }
  },
  location: { search },
  setCollection,
  clearCollection,
  syncAction,
  profile,
  collection,
  setBucket,
  sandbox
}) => {
  const [loading, setLoading] = useState(true)
  const [dropActive, setDropActive] = useState(false)

  const location = queryString.parse(search).location

  useEffect(() => {
    setBucket(bucket, location)
    return () => setBucket(undefined, undefined)
  }, [bucket, location, setBucket])

  useEffect(() => {
    const asyncEffect = async () => {
      try {
        const collection = await loadCollection(bucket, location)
        collection.sandboxMode = sandbox
        setCollection(collection)
      } catch (error) {
        console.error(error)
        try {
          // See if we are logged in.
          checkLoginStatus()
          await locationFinder(bucket)
        } catch {
          return
        }
      }
      setLoading(false)
    }
    asyncEffect()
    return () => clearCollection()
  }, [bucket, clearCollection, location, sandbox, setCollection])

  const handleClose = useCallback(() => {
    history.push('/')
  }, [])

  const handleSubmit = useCallback(
    async choice => {
      syncAction(setCollectionType, [choice])
    },
    [syncAction]
  )

  const handleDragEnter = useCallback(() => {
    setDropActive(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropActive(false)
  }, [])

  const handleDrop = useCallback(
    async fileList => {
      setDropActive(false)
      const [zipFile] = fileList.filter(file =>
        file.name.toLowerCase().endsWith('.zip')
      )
      if (zipFile) {
        const [files, annotationsJSON] = await importDataset(zipFile)
        syncAction(bootstrap, [files, annotationsJSON])
        return
      }
      const images = fileList.filter(file => file.type.startsWith('image/'))
      const videos = fileList.filter(file => file.type.startsWith('video/'))
      const files = await generateFiles(images, videos)
      syncAction(uploadImages, [files])
    },
    [syncAction]
  )

  const type = collection.type

  let dissabled = {}
  if (sandbox) {
    dissabled.uploadZip = true
    dissabled.delete = true
    dissabled.markAsNegative = true
    dissabled.markAs = true
  }

  if (type === 'classification') {
    dissabled.uploadZip = true
    dissabled.delete = true
    dissabled.markAsNegative = true
    dissabled.markAs = true
    dissabled.exportYOLO = true
    dissabled.exportCreateML = true
    dissabled.exportPascalVOC = true
    window.MAX_IMAGE_WIDTH = 224
    window.MAX_IMAGE_HEIGHT = 224
    window.IMAGE_SCALE_MODE = 'SCALE_FILL'
  } else {
    window.MAX_IMAGE_WIDTH = 1500
    window.MAX_IMAGE_HEIGHT = 1500
    window.IMAGE_SCALE_MODE = 'ASPECT_FIT'
  }

  return (
    <>
      <ChooseBucketModal
        isOpen={!loading && !type}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <Loading active={loading} />

      <AppBarLayout
        appBar={
          <AppBar
            bucket={bucket}
            location={location}
            profile={profile}
            sandbox={sandbox}
            dissabled={dissabled}
          />
        }
        content={
          <Dropzone
            disableClick
            style={{ position: 'absolute' }} /* must override from here */
            className={styles.dropzone}
            accept="image/*,video/*,.zip"
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <div className={dropActive ? styles.dropActive : styles.drop}>
              <div className={styles.dropOutline}>
                <div className={styles.dropText}>
                  Drop to upload your images
                </div>
              </div>
            </div>
            <AnnotationPanel location={location} bucket={bucket} type={type} />
          </Dropzone>
        }
      />
    </>
  )
}

const mapStateToProps = state => ({
  collection: state.collection,
  profile: state.profile
})
const mapDispatchToProps = {
  setBucket,
  setCollection,
  clearCollection,
  syncAction
}
export default connect(mapStateToProps, mapDispatchToProps)(App)
