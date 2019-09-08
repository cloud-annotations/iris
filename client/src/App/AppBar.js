import React, { useState, useCallback, useRef } from 'react'
import { connect } from 'react-redux'
import Toggle from 'react-toggle'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import 'react-toggle/style.css'
import './react-toggle-overrides.css'

import { ProfileDropDown } from 'common/DropDown/DropDown'
import history from 'globalHistory'
import { uploadImages, syncAction, deleteImages } from 'redux/collection'

import moon from './moon.png'
import styles from './AppBar.module.css'
import useOnClickOutside from 'hooks/useOnClickOutside'
import { getDataTransferItems, convertToJpeg, videoToJpegs } from 'Utils'
import { setActiveImage } from 'redux/editor'
import COS from 'api/COSv2'
import { defaultEndpoint } from 'endpoints'

const FPS = 3

const generateFiles = async (images, videos) => {
  const imageFiles = images.map(async image => await convertToJpeg(image))
  const videoFiles = videos.map(async video => await videoToJpegs(video, FPS))
  return (await Promise.all([...imageFiles, ...videoFiles])).flat()
}

const zipImages = async (bucket, collection, folder) => {
  const labeledImageNames = Object.keys(collection.annotations)
  return await Promise.all(
    labeledImageNames.map(async name => {
      const imgData = await new COS({ endpoint: defaultEndpoint }).getObject({
        Bucket: bucket,
        Key: name
      })
      folder.file(name, imgData, { binary: true })

      const image = new Image()
      image.src = URL.createObjectURL(imgData)
      return await new Promise(resolve => {
        image.onload = () => {
          resolve({
            name: name,
            dimensions: { width: image.width, height: image.height }
          })
        }
      })
    })
  )
}

const AppBar = ({
  bucket,
  profile,
  saving,
  syncAction,
  imageRange,
  setActiveImage,
  collection
}) => {
  const optionsRef = useRef(null)
  const fileInputRef = useRef(null)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [lastHoveredOption, setLastHoveredOption] = useState(undefined)
  const [darkModeToggle, setDarkModeToggle] = useState(
    localStorage.getItem('darkMode') === 'true'
  )

  const handleToggleDarkMode = useCallback(e => {
    e.target.blur() // give up focus so other inputs work properly.
    const darkMode = !(localStorage.getItem('darkMode') === 'true')
    setDarkModeToggle(darkMode)
    localStorage.setItem('darkMode', darkMode)
    document.body.className = darkMode ? 'dark' : 'light'
  }, [])

  const handleClick = useCallback(() => {
    history.push('/')
  }, [])

  const handleOptionClick = useCallback(() => {
    setOptionsOpen(true)
  }, [])

  const handleClickOutside = useCallback(() => {
    setOptionsOpen(false)
  }, [])

  const handleOptionHover = useCallback(e => {
    setLastHoveredOption(e.currentTarget.id)
  }, [])

  useOnClickOutside(optionsRef, handleClickOutside, true)

  const handleFileChosen = useCallback(
    async e => {
      e.stopPropagation()
      const fileList = getDataTransferItems(e)
      const images = fileList.filter(file => file.type.startsWith('image/'))
      const videos = fileList.filter(file => file.type.startsWith('video/'))
      const files = await generateFiles(images, videos)
      syncAction(uploadImages, [files])
      fileInputRef.current.value = null
      fileInputRef.current.blur()
      setOptionsOpen(false)
    },
    [syncAction]
  )

  const handleDeleteImage = useCallback(
    e => {
      e.stopPropagation()
      syncAction(deleteImages, [imageRange])
      setActiveImage(undefined)
      setOptionsOpen(false)
    },
    [imageRange, syncAction, setActiveImage]
  )

  const handleExportYOLO = useCallback(
    async e => {
      e.stopPropagation()
      setOptionsOpen(false)
      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(bucket, collection, folder)

      images.forEach(({ name }) => {
        const annotationTxt = collection.annotations[name]
          .map(annotation => {
            const labelIndex = collection.labels.indexOf(annotation.label)
            const width = (annotation.x2 - annotation.x).toFixed(6)
            const height = (annotation.y2 - annotation.y).toFixed(6)
            const midX = (annotation.x + width / 2).toFixed(6)
            const midY = (annotation.y + height / 2).toFixed(6)
            return `${labelIndex} ${midX} ${midY} ${width} ${height}`
          })
          .join('\n')
        folder.file(
          `${name.replace(/\.(jpg|jpeg|png)$/i, '')}.txt`,
          annotationTxt
        )
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
    },
    [bucket, collection]
  )

  const handleExportCreateML = useCallback(
    async e => {
      e.stopPropagation()
      setOptionsOpen(false)
      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(bucket, collection, folder)

      const createMLAnnotations = images.map(({ name, dimensions }) => ({
        image: name,
        annotations: collection.annotations[name].map(annotation => {
          const relWidth = annotation.x2 - annotation.x
          const relHeight = annotation.y2 - annotation.y
          const midX = (annotation.x + relWidth / 2) * dimensions.width
          const midY = (annotation.y + relHeight / 2) * dimensions.height
          const width = relWidth * dimensions.width
          const height = relHeight * dimensions.height
          return {
            label: annotation.label,
            coordinates: {
              x: Math.round(midX),
              y: Math.round(midY),
              width: Math.round(width),
              height: Math.round(height)
            }
          }
        })
      }))
      folder.file('annotations.json', JSON.stringify(createMLAnnotations))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
    },
    [bucket, collection]
  )

  const handleExportVOC = useCallback(
    async e => {
      e.stopPropagation()
      setOptionsOpen(false)
      const zip = new JSZip()
      const folder = zip.folder(bucket)
      await zipImages(bucket, collection, folder)

      const collectionJson = collection.toJSON()
      folder.file('_annotations.json', JSON.stringify(collectionJson))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
    },
    [bucket, collection]
  )

  return (
    <div className={styles.wrapper}>
      <div onClick={handleClick} className={styles.home}>
        <svg className={styles.homeIcon} viewBox="0 0 32 32">
          <path d="M11.17 6l3.42 3.41.58.59H28v16H4V6h7.17m0-2H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H16l-3.41-3.41A2 2 0 0 0 11.17 4z" />
        </svg>
      </div>
      <div className={styles.headerWrapper}>
        <div className={styles.bucketName}>{bucket}</div>
        <div className={styles.options}>
          <div ref={optionsRef} className={styles.options}>
            <div
              id="file"
              className={
                optionsOpen && lastHoveredOption === 'file'
                  ? styles.optionOpen
                  : styles.option
              }
              onClick={handleOptionClick}
              onMouseEnter={handleOptionHover}
            >
              File
              <div
                className={
                  optionsOpen && lastHoveredOption === 'file'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                <div className={styles.listItem}>
                  Upload media
                  <input
                    className={styles.upload}
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChosen}
                    multiple
                  />
                </div>
                <div className={styles.listDivider} />
                <div className={styles.listItem} onClick={handleExportYOLO}>
                  Export as YOLO
                </div>
                <div className={styles.listItem} onClick={handleExportCreateML}>
                  Export as Create ML
                </div>
                <div className={styles.listItem} onClick={handleExportVOC}>
                  Export as Pascal VOC
                </div>
              </div>
            </div>

            <div
              id="image"
              className={
                optionsOpen && lastHoveredOption === 'image'
                  ? styles.optionOpen
                  : styles.option
              }
              onClick={handleOptionClick}
              onMouseEnter={handleOptionHover}
            >
              Image
              <div
                className={
                  optionsOpen && lastHoveredOption === 'image'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                <div className={styles.listItem} onClick={handleDeleteImage}>
                  {imageRange.length > 1
                    ? `Delete ${imageRange.length} images`
                    : 'Delete image'}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.saved}>
            {saving > 0 ? 'Saving...' : 'Saved'}
          </div>
        </div>
      </div>
      <Toggle
        className={styles.toggle}
        checked={darkModeToggle}
        icons={{
          checked: null,
          unchecked: (
            <img
              alt=""
              src={moon}
              width="16"
              height="16"
              role="presentation"
              style={{ pointerEvents: 'none' }}
            />
          )
        }}
        onChange={handleToggleDarkMode}
      />
      <ProfileDropDown profile={profile} />
    </div>
  )
}

const mapPropsToState = state => ({
  saving: state.editor.saving,
  imageRange: state.editor.range,
  collection: state.collection
})
const mapDispatchToProps = {
  syncAction,
  setActiveImage
}
export default connect(
  mapPropsToState,
  mapDispatchToProps
)(AppBar)
