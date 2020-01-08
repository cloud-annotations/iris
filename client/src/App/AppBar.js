import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'
import { connect } from 'react-redux'
import Toggle from 'react-toggle'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import 'react-toggle/style.css'
import './react-toggle-overrides.css'

import { ProfileDropDown } from 'common/DropDown/DropDown'
import history from 'globalHistory'
import {
  uploadImages,
  syncAction,
  deleteImages,
  createLabel,
  labelImages,
  addModel
} from 'redux/collection'
import { incrementSaving, decrementSaving } from 'redux/editor'

import moon from './moon.png'
import styles from './AppBar.module.css'
import useOnClickOutside from 'hooks/useOnClickOutside'
import { getDataTransferItems, convertToJpeg, videoToJpegs } from 'Utils'
import { setActiveImage } from 'redux/editor'
import COS from 'api/COSv2'
import { defaultEndpoint } from 'endpoints'

const generateFiles = async (images, videos) => {
  const imageFiles = images.map(
    async image =>
      await convertToJpeg(image, {
        maxHeight: window.MAX_IMAGE_HEIGHT,
        maxWidth: window.MAX_IMAGE_WIDTH,
        mode: window.IMAGE_SCALE_MODE
      })
  )
  const videoFiles = videos.map(
    async video =>
      await videoToJpegs(video, {
        fps: window.FPS,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        maxWidth: window.MAX_IMAGE_WIDTH,
        mode: window.IMAGE_SCALE_MODE
      })
  )
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

const PoopUp = connect(state => ({
  resources: state.wmlResources.resources,
  activeResource: state.wmlResources.activeResource
}))(({ resources, activeResource }) => {
  return (
    <div className={styles.popupWrapper}>
      <div className={styles.popup}>
        <div className={styles.contentWrapper}>
          <div className={styles.popupTitle}>Start a training run</div>
          <div className={styles.popupBody}>
            Training will temporarily connect this bucket to the Watson Machine
            Learning service. Your images and annotations will be used to create
            your own personal object detection model.
          </div>
          <div className={styles.popupFormItem}>
            <div className={styles.popupSelectLabelWrapper}>
              <label for="wml-select" className={styles.popupSelectLabel}>
                Watson Machine Learning instance
              </label>
              <div className={styles.popupSelectWrapper}>
                <select className={styles.popupSelect} id="wml-select">
                  {resources.map(r => (
                    <option value={r.id} selected={r.id === activeResource}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <svg
                  className={styles.popupSelectIcon}
                  focusable="false"
                  preserveAspectRatio="xMidYMid meet"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.popupButtons}>
          <div className={styles.popupButtonSecondary}>Cancel</div>
          <div className={styles.popupButtonPrimary}>Train</div>
        </div>
      </div>
    </div>
  )
})

const AppBar = ({
  bucket,
  profile,
  saving,
  syncAction,
  imageRange,
  setActiveImage,
  collection,
  incrementSaving,
  decrementSaving,
  addModel
}) => {
  const optionsRef = useRef(undefined)
  const mediaInputRef = useRef(undefined)
  const modelInputRef = useRef(undefined)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [lastHoveredOption, setLastHoveredOption] = useState(undefined)
  const [lastHoveredSubOption, setLastHoveredSubOption] = useState(undefined)
  const [darkModeToggle, setDarkModeToggle] = useState(
    document.body.className === 'dark'
  )

  useEffect(() => {
    const observer = new MutationObserver(mutationsList => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          setDarkModeToggle(document.body.className === 'dark')
        }
      }
    })
    observer.observe(document.body, { attributes: true })
    return () => {
      observer.disconnect()
    }
  }, [])

  const handleToggleDarkMode = useCallback(e => {
    e.target.blur() // give up focus so other inputs work properly.
    setDarkModeToggle(mode => {
      const nextMode = !mode
      localStorage.setItem('darkMode', nextMode)
      document.body.className = nextMode ? 'dark' : 'light'
      return nextMode
    })
  }, [])

  const handleClick = useCallback(() => {
    history.push('/')
  }, [])

  const handleOptionClick = useCallback(() => {
    setOptionsOpen(true)
  }, [])

  const handleClickOutside = useCallback(() => {
    setLastHoveredSubOption(undefined)
    setOptionsOpen(false)
  }, [])

  const handleOptionHover = useCallback(e => {
    setLastHoveredOption(e.currentTarget.id)
  }, [])

  const handleSubOptionHover = useCallback(e => {
    setLastHoveredSubOption(e.currentTarget.id)
  }, [])

  useOnClickOutside(optionsRef, handleClickOutside, true)

  const handleMediaChosen = useCallback(
    async e => {
      e.stopPropagation()
      const fileList = getDataTransferItems(e)
      const images = fileList.filter(file => file.type.startsWith('image/'))
      const videos = fileList.filter(file => file.type.startsWith('video/'))
      const files = await generateFiles(images, videos)
      syncAction(uploadImages, [files])
      mediaInputRef.current.value = null
      mediaInputRef.current.blur()
      setOptionsOpen(false)
    },
    [syncAction]
  )

  const handleModelChosen = useCallback(
    async e => {
      e.stopPropagation()
      incrementSaving()

      const fileList = getDataTransferItems(e)
      const [zipFile] = fileList.filter(file =>
        file.name.toLowerCase().endsWith('.zip')
      )

      JSZip.loadAsync(zipFile).then(zip => {
        const modelFile = '/model.json'
        let basePath
        zip.forEach(relativePath => {
          if (relativePath.toLowerCase().endsWith(modelFile)) {
            basePath = relativePath.substring(
              0,
              relativePath.length - modelFile.length
            )
          }
        })
        if (basePath !== undefined) {
          let promises = []
          zip.forEach((relativePath, zipEntry) => {
            if (relativePath.startsWith(basePath)) {
              const fileName = relativePath.substring(
                basePath.length,
                relativePath.length
              )
              if (fileName !== '/') {
                console.log(`model_web${fileName}`)
                const uploadPromise = zipEntry.async('blob').then(blob =>
                  collection.cos.putObject({
                    Bucket: collection.bucket,
                    Key: `model_web${fileName}`,
                    Body: blob
                  })
                )
                promises = [...promises, uploadPromise]
              }
            }
          })
          Promise.all(promises).then(() => {
            addModel('model_web')
            decrementSaving()
          })
        }
      })

      modelInputRef.current.value = null
      modelInputRef.current.blur()
      setOptionsOpen(false)
    },
    [
      addModel,
      collection.bucket,
      collection.cos,
      decrementSaving,
      incrementSaving
    ]
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
      const images = await zipImages(bucket, collection, folder)
      images.forEach(({ name, dimensions }) => {
        const annotation = (
          <annotation>
            <folder>{bucket}</folder>
            <filename>{name}</filename>
            <size>
              <width>{Math.round(dimensions.width)}</width>
              <height>{Math.round(dimensions.height)}</height>
              <depth>3</depth>
            </size>
            {collection.annotations[name].map(annotation => (
              <object>
                <name>{annotation.label}</name>
                <pose>Unspecified</pose>
                <truncated>0</truncated>
                <difficult>0</difficult>
                <bndbox>
                  <xmin>{Math.round(annotation.x * dimensions.width)}</xmin>
                  <ymin>{Math.round(annotation.y * dimensions.height)}</ymin>
                  <xmax>{Math.round(annotation.x2 * dimensions.width)}</xmax>
                  <ymax>{Math.round(annotation.y2 * dimensions.height)}</ymax>
                </bndbox>
              </object>
            ))}
          </annotation>
        )
        folder.file(
          `${name.replace(/\.(jpg|jpeg|png)$/i, '')}.xml`,
          ReactDOMServer.renderToStaticMarkup(annotation)
        )
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
    },
    [bucket, collection]
  )

  const handleEmptyLabelImage = useCallback(
    label => e => {
      e.stopPropagation()
      setOptionsOpen(false)
      setLastHoveredSubOption(undefined)
      if (!collection.labels.includes(label)) {
        syncAction(createLabel, [label])
      }
      syncAction(labelImages, [imageRange, label])
    },
    [collection.labels, imageRange, syncAction]
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
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChosen}
                    multiple
                  />
                </div>
                <div className={styles.listItem}>
                  Upload model zip
                  <input
                    className={styles.upload}
                    ref={modelInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleModelChosen}
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
              {imageRange.length > 1
                ? `Images (${imageRange.length})`
                : 'Image'}
              <div
                className={
                  optionsOpen && lastHoveredOption === 'image'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                <div
                  className={styles.listItem}
                  onClick={handleDeleteImage}
                  onMouseEnter={handleSubOptionHover}
                >
                  Delete
                </div>

                <div className={styles.listDivider} />

                <div
                  className={styles.listItem}
                  onClick={handleEmptyLabelImage('Negative')}
                  onMouseEnter={handleSubOptionHover}
                >
                  Mark as "Negative"
                </div>

                <div
                  id="mark-as"
                  className={
                    collection.labels.length > 0 &&
                    optionsOpen &&
                    lastHoveredSubOption === 'mark-as'
                      ? styles.popwrapperOpen
                      : styles.popwrapper
                  }
                  onMouseEnter={handleSubOptionHover}
                >
                  <div
                    className={
                      collection.labels.length > 0
                        ? styles.listItem
                        : styles.disabled
                    }
                  >
                    Mark as
                    <svg
                      className={styles.chevronRightIcon}
                      focusable="false"
                      preserveAspectRatio="xMidYMid meet"
                      width="16"
                      height="16"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M22 16L12 26l-1.4-1.4 8.6-8.6-8.6-8.6L12 6z"></path>
                    </svg>
                  </div>

                  <div
                    className={
                      collection.labels.length > 0 &&
                      optionsOpen &&
                      lastHoveredSubOption === 'mark-as'
                        ? styles.popoutOpen
                        : styles.popout
                    }
                  >
                    {collection.labels.map(label => (
                      <div
                        className={styles.listItem}
                        onClick={handleEmptyLabelImage(label)}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.saved}>
            {saving > 0 ? 'Saving...' : 'Saved'}
          </div>
        </div>
      </div>
      <div
        className={styles.train}
        onClick={() => {
          history.push('/training')
        }}
      >
        <div className={styles.trainText}>Train model</div>
      </div>
      <div className={styles.notification}>
        <div className={styles.notificationTitle}>
          No Watson Machine Learning instance available
        </div>
        <div className={styles.notificationAction}>Create</div>
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
      <PoopUp />
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
  setActiveImage,
  incrementSaving,
  decrementSaving,
  addModel
}
export default connect(mapPropsToState, mapDispatchToProps)(AppBar)
