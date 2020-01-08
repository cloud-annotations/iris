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
  syncAction
} from 'redux/collection'
import Localization from './Localization/Localization'
import LegacyApp from './Classification/App'
import { locationFinder } from './endpointFinder'
import ChooseBucketModal from './ChooseBucketModal'
import AppBar from './AppBar'
import AppBarLayout from './AppBarLayout'

import styles from './App.module.css'
import { convertToJpeg, videoToJpegs } from 'Utils'

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
      return <div />
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
  collection
}) => {
  const [loading, setLoading] = useState(true)
  const [dropActive, setDropActive] = useState(false)

  const location = queryString.parse(search).location

  useEffect(() => {
    const asyncEffect = async () => {
      try {
        setCollection(await loadCollection(bucket, location))
      } catch (error) {
        console.error(error)
        if (error.message === 'Forbidden') {
          history.push('/login')
          return
        }
        await locationFinder(bucket)
      }
      setLoading(false)
    }
    asyncEffect()
    return () => clearCollection()
  }, [bucket, clearCollection, location, setCollection])

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
      const images = fileList.filter(file => file.type.startsWith('image/'))
      const videos = fileList.filter(file => file.type.startsWith('video/'))
      const files = await generateFiles(images, videos)
      syncAction(uploadImages, [files])
    },
    [syncAction]
  )

  const type = collection.type

  return (
    <>
      <ChooseBucketModal
        isOpen={!loading && !type}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <Loading active={loading} />

      {type === 'classification' ? (
        <LegacyApp location={location} bucket={bucket} />
      ) : (
        <AppBarLayout
          appBar={
            <AppBar bucket={bucket} location={location} profile={profile} />
          }
          content={
            <Dropzone
              disableClick
              style={{ position: 'absolute' }} /* must override from here */
              className={styles.dropzone}
              accept="image/*,video/*"
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
              <AnnotationPanel
                location={location}
                bucket={bucket}
                type={type}
              />
            </Dropzone>
          }
        />
      )}
    </>
  )
}

const mapStateToProps = state => ({
  collection: state.collection,
  profile: state.profile
})
const mapDispatchToProps = {
  setCollection,
  clearCollection,
  syncAction
}
export default connect(mapStateToProps, mapDispatchToProps)(App)
