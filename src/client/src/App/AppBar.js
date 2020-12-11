import React, { useState, useCallback, useRef } from 'react'
import ReactDOMServer from 'react-dom/server'
import { connect } from 'react-redux'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Loading } from 'carbon-components-react'

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
  addModel,
  bootstrap,
} from 'redux/collection'
import { incrementSaving, decrementSaving } from 'redux/editor'

import styles from './AppBar.module.css'
import useOnClickOutside from 'hooks/useOnClickOutside'
import { getDataTransferItems, convertToJpeg, videoToJpegs } from 'Utils'
import { setActiveImage } from 'redux/editor'
import COS from 'api/COSv2'
import {
  fullPublicEndpointForLocationConstraint,
  endpointForLocationConstraint,
} from 'endpoints'
import { setActiveWMLResource } from 'redux/wmlResources'

import { importDataset } from 'dataset-utils'

import TrainButton from './TrainButton'

const generateFiles = async (images, videos) => {
  const imageFiles = images.map(
    async (image) =>
      await convertToJpeg(image, {
        maxHeight: window.MAX_IMAGE_HEIGHT,
        maxWidth: window.MAX_IMAGE_WIDTH,
        mode: window.IMAGE_SCALE_MODE,
      })
  )
  const videoFiles = videos.map(
    async (video) =>
      await videoToJpegs(video, {
        fps: window.FPS,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        maxWidth: window.MAX_IMAGE_WIDTH,
        mode: window.IMAGE_SCALE_MODE,
      })
  )
  return (await Promise.all([...imageFiles, ...videoFiles])).flat()
}

const zipImages = async (
  endpoint,
  bucket,
  collection,
  folder,
  setFilesZipped
) => {
  const labeledImageNames = Object.keys(collection.annotations)
  return await Promise.all(
    labeledImageNames.map(async (name) => {
      try {
        const imgData = await new COS({ endpoint: endpoint }).getObject({
          Bucket: bucket,
          Key: name,
        })
        folder.file(name, imgData, { binary: true })

        const image = new Image()
        image.src = URL.createObjectURL(imgData)
        return await new Promise((resolve) => {
          image.onload = () => {
            if (setFilesZipped) {
              setFilesZipped((zipped) => (zipped += 1))
            }

            resolve({
              name: name,
              dimensions: { width: image.width, height: image.height },
            })
          }
        })
      } catch {
        return await new Promise((resolve) => {
          console.error(`failed to download: skipping ${name}`)
          if (setFilesZipped) {
            setFilesZipped((zipped) => (zipped += 1))
          }

          resolve({
            name: name,
            dimensions: { width: 0, height: 0 },
          })
        })
      }
    })
  )
}

const Downloader = ({ current, total }) => {
  const amount = Number.parseInt((1 - current / total) * 169, 10)
  return (
    <div className={total === 0 ? styles.downloaderHidden : styles.downloader}>
      <div className={styles.downloaderContentWrapper}>
        <svg
          style={{
            width: '20px',
            height: '20px',
            fill: 'transparent',
            margin: '0 16px',
            transform: 'rotate(-90deg)',
          }}
          viewBox="-29.8125 -29.8125 59.625 59.625"
        >
          <circle
            style={{
              strokeWidth: 6,
              stroke: '#e0e0e0',
              strokeDashoffset: 0,
              strokeLinecap: 'butt',
              strokeDasharray: 169,
            }}
            cx="0"
            cy="0"
            r="26.8125"
          ></circle>
          <circle
            style={{
              strokeWidth: 6,
              stroke: '#0f62fe',
              strokeDashoffset: amount,
              strokeLinecap: 'butt',
              strokeDasharray: 169,
            }}
            cx="0"
            cy="0"
            r="26.8125"
          ></circle>
        </svg>
        <div
          className={styles.downloaderText}
        >{`Zipping ${current.toLocaleString('en')}/${total.toLocaleString(
          'en'
        )} files`}</div>
      </div>
    </div>
  )
}

const getOrCreateBinding = async (cosResources, activeCOSResource) => {
  // find or create a binding.
  const cosResourceInfo = cosResources.find((r) => r.id === activeCOSResource)
  const credentialsEndpoint =
    '/api/proxy/resource-controller.cloud.ibm.com/v2/resource_keys'
  const listCredentialsEndpoint = `${credentialsEndpoint}?name=cloud-annotations-binding&source_crn=${cosResourceInfo.crn}`
  const credentialsList = await fetch(listCredentialsEndpoint).then((res) =>
    res.json()
  )

  let creds
  // create binding if none exists.
  if (credentialsList.resources.length > 0) {
    creds = credentialsList.resources[0]
  } else {
    const resCreate = await fetch(credentialsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'cloud-annotations-binding',
        source: cosResourceInfo.guid,
        role: 'writer',
        parameters: {
          HMAC: true,
        },
      }),
    }).then((res) => res.json())
    creds = resCreate
  }
  return creds.credentials
}

const AppBar = ({
  bucket,
  location,
  profile,
  saving,
  syncAction,
  imageRange,
  setActiveImage,
  collection,
  incrementSaving,
  decrementSaving,
  addModel,
  cosResources,
  activeCOSResource,
  sandbox,
  dissabled,
  bootstrap,
}) => {
  const optionsRef = useRef(undefined)
  const mediaInputRef = useRef(undefined)
  const modelInputRef = useRef(undefined)
  const importInputRef = useRef(undefined)

  const [filesZipped, setFilesZipped] = useState(0)
  const [filesToZip, setFilesToZip] = useState(0)

  const [optionsOpen, setOptionsOpen] = useState(false)
  const [lastHoveredOption, setLastHoveredOption] = useState(undefined)
  const [lastHoveredSubOption, setLastHoveredSubOption] = useState(undefined)

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

  const handleOptionHover = useCallback((e) => {
    setLastHoveredOption(e.currentTarget.id)
  }, [])

  const handleSubOptionHover = useCallback((e) => {
    setLastHoveredSubOption(e.currentTarget.id)
  }, [])

  useOnClickOutside(optionsRef, handleClickOutside, true)

  const handleMediaChosen = useCallback(
    async (e) => {
      e.stopPropagation()
      const fileList = getDataTransferItems(e)
      const images = fileList.filter((file) => file.type.startsWith('image/'))
      const videos = fileList.filter((file) => file.type.startsWith('video/'))
      const files = await generateFiles(images, videos)
      syncAction(uploadImages, [files])
      mediaInputRef.current.value = null
      mediaInputRef.current.blur()
      setOptionsOpen(false)
    },
    [syncAction]
  )

  const handleModelChosen = useCallback(
    async (e) => {
      e.stopPropagation()
      incrementSaving()

      const fileList = getDataTransferItems(e)
      const [zipFile] = fileList.filter((file) =>
        file.name.toLowerCase().endsWith('.zip')
      )

      JSZip.loadAsync(zipFile).then((zip) => {
        const modelFile = '/model.json'
        let basePath
        zip.forEach((relativePath) => {
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
                const uploadPromise = zipEntry.async('blob').then((blob) =>
                  collection.cos.putObject({
                    Bucket: collection.bucket,
                    Key: `model_web${fileName}`,
                    Body: blob,
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
      incrementSaving,
    ]
  )

  const handleDeleteImage = useCallback(
    (e) => {
      e.stopPropagation()
      syncAction(deleteImages, [imageRange])
      setActiveImage(undefined)
      setOptionsOpen(false)
    },
    [imageRange, syncAction, setActiveImage]
  )

  const handleExportNotebook = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      const credentials = await getOrCreateBinding(
        cosResources,
        activeCOSResource
      )

      const classificationNotebook = await fetch(
        '/api/proxy/github.com/cloud-annotations/notebooks/raw/master/classification-notebook.ipynb'
      ).then((r) => r.json())

      const newCells = classificationNotebook.cells.map((cell) => {
        const newSource = cell.source.map((s) =>
          s
            .replace('$$$BUCKET$$$', bucket)
            .replace('$$$IBM_API_KEY_ID$$$', credentials.apikey)
            .replace('$$$IAM_SERVICE_ID$$$', credentials.resource_instance_id)
            .replace(
              '$$$ENDPOINT$$$',
              fullPublicEndpointForLocationConstraint(location)
            )
        )
        return { ...cell, source: newSource }
      })

      const blob = new Blob(
        [
          JSON.stringify(
            { ...classificationNotebook, cells: newCells },
            null,
            1
          ),
        ],
        {
          type: 'application/json',
        }
      )
      saveAs(blob, 'cloud-annotations-training.ipynb')
    },
    [cosResources, activeCOSResource, bucket, location]
  )

  const handleExportZip = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the annotations.json
      setFilesToZip(Object.keys(collection.annotations).length + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )

      folder.file('_annotations.json', JSON.stringify(collection.toJSON()))

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleExportYOLO = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the annotations.json
      setFilesToZip(Object.keys(collection.annotations).length + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )

      images.forEach(({ name }) => {
        const annotationTxt = collection.annotations[name]
          .map((annotation) => {
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

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleExportCreateML = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the annotations.json
      setFilesToZip(Object.keys(collection.annotations).length + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )

      const createMLAnnotations = images.map(({ name, dimensions }) => ({
        image: name,
        annotations: collection.annotations[name].map((annotation) => {
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
              height: Math.round(height),
            },
          }
        }),
      }))
      folder.file('annotations.json', JSON.stringify(createMLAnnotations))

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleExportVOC = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the annotations.json
      setFilesToZip(Object.keys(collection.annotations).length + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )
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
            {collection.annotations[name].map((annotation) => (
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

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleExportMaximo = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the prop.json
      setFilesToZip(Object.keys(collection.annotations).length * 2 + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )
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
            {collection.annotations[name].map((annotation) => (
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
        setFilesZipped((zipped) => (zipped += 1))
      })

      folder.file(
        'prop.json',
        JSON.stringify({
          usage: 'generic',
          name: bucket,
          type: 0,
          scenario: '',
          prop_version: 'PROP_VESION_1',
          pre_process: '',
          category_prop_info: '[]',
          action_prop_info: '[]',
          file_prop_info: '[]',
        })
      )

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleImportDataset = useCallback(
    async (e) => {
      e.stopPropagation()
      incrementSaving()

      const fileList = getDataTransferItems(e)
      const [zipFile] = fileList.filter((file) =>
        file.name.toLowerCase().endsWith('.zip')
      )

      const [files, annotationsJSON] = await importDataset(zipFile)
      syncAction(bootstrap, [files, annotationsJSON])
      decrementSaving()

      importInputRef.current.value = null
      importInputRef.current.blur()
      setOptionsOpen(false)
    },
    [bootstrap, decrementSaving, incrementSaving, syncAction]
  )

  const handleEmptyLabelImage = useCallback(
    (label) => (e) => {
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
      <Downloader current={filesZipped} total={filesToZip} />
      <div onClick={handleClick} className={styles.home}>
        <svg className={styles.homeIcon} viewBox="0 0 32 32">
          <path d="M11.17 6l3.42 3.41.58.59H28v16H4V6h7.17m0-2H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H16l-3.41-3.41A2 2 0 0 0 11.17 4z" />
        </svg>
      </div>
      <div className={styles.headerWrapper}>
        <div className={styles.bucketName}>{sandbox ? 'sandbox' : bucket}</div>
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
                <div
                  className={styles.listItem}
                  onMouseEnter={handleSubOptionHover}
                >
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
                <div
                  className={
                    dissabled.uploadZip ? styles.disabled : styles.listItem
                  }
                  onMouseEnter={handleSubOptionHover}
                >
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
                <div
                  className={styles.listItem}
                  onMouseEnter={handleSubOptionHover}
                >
                  Import dataset
                  <input
                    className={styles.upload}
                    ref={importInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleImportDataset}
                  />
                </div>
                <div className={styles.listDivider} />
                <div
                  className={
                    dissabled.exportYOLO ? styles.disabled : styles.listItem
                  }
                  onClick={handleExportYOLO}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as YOLO
                </div>
                <div
                  className={
                    dissabled.exportCreateML ? styles.disabled : styles.listItem
                  }
                  onClick={handleExportCreateML}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as Create ML
                </div>
                <div
                  className={
                    dissabled.exportPascalVOC
                      ? styles.disabled
                      : styles.listItem
                  }
                  onClick={handleExportVOC}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as Pascal VOC
                </div>

                <div
                  id="maximo"
                  className={
                    dissabled.exportMaximo
                      ? styles.popwrapper
                      : optionsOpen && lastHoveredSubOption === 'maximo'
                      ? styles.popwrapperOpen
                      : styles.popwrapper
                  }
                  onMouseEnter={handleSubOptionHover}
                >
                  <div
                    className={
                      dissabled.exportMaximo ? styles.disabled : styles.listItem
                    }
                    onClick={handleExportMaximo}
                  >
                    Export as Maximo Visual Inspection
                    <svg
                      className={styles.chevronRightIcon}
                      focusable="false"
                      preserveAspectRatio="xMidYMid meet"
                      width="16"
                      height="16"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <polygon points="17 22 17 13 13 13 13 15 15 15 15 22 12 22 12 24 20 24 20 22 17 22" />
                      <path d="M16,7a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,7Z" />
                      <path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z" />
                    </svg>
                  </div>

                  <div
                    className={
                      dissabled.exportMaximo
                        ? styles.popout
                        : optionsOpen && lastHoveredSubOption === 'maximo'
                        ? styles.popoutOpenTooltip
                        : styles.popout
                    }
                  >
                    <div className={styles.tooltipper}>
                      <h6 className={styles.tooltipH6}>
                        IBM Maximo Visual Inspection
                      </h6>
                      <p className={styles.tooltipP}>
                        A platform tailored for domain experts to label, train
                        and deploy models for variety of industrial use cases.
                        Quickly build solutions at the edge, monitor assets and
                        inspect production lines for quality.
                      </p>
                      <div className={styles.tooltipFooter}>
                        <a
                          href="https://www.ibm.com/products/ibm-maximo-visual-inspection"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.tooltipLink}
                        >
                          Learn more
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    dissabled.exportZip ? styles.disabled : styles.listItem
                  }
                  onClick={handleExportZip}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as zip
                </div>
                <div
                  className={
                    cosResources.length === 0 || dissabled.exportNotebook
                      ? styles.disabled
                      : styles.listItem
                  }
                  onClick={handleExportNotebook}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as Notebook (.ipynb)
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
                  className={
                    dissabled.delete ? styles.disabled : styles.listItem
                  }
                  onClick={handleDeleteImage}
                  onMouseEnter={handleSubOptionHover}
                >
                  Delete
                </div>

                <div className={styles.listDivider} />

                <div
                  className={
                    dissabled.markAsNegative ? styles.disabled : styles.listItem
                  }
                  onClick={handleEmptyLabelImage('Negative')}
                  onMouseEnter={handleSubOptionHover}
                >
                  Mark as "Negative"
                </div>

                <div
                  id="mark-as"
                  className={
                    dissabled.markAs
                      ? styles.popwrapper
                      : collection.labels.length > 0 &&
                        optionsOpen &&
                        lastHoveredSubOption === 'mark-as'
                      ? styles.popwrapperOpen
                      : styles.popwrapper
                  }
                  onMouseEnter={handleSubOptionHover}
                >
                  <div
                    className={
                      dissabled.markAs
                        ? styles.disabled
                        : collection.labels.length > 0
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
                      dissabled.markAs
                        ? styles.popout
                        : collection.labels.length > 0 &&
                          optionsOpen &&
                          lastHoveredSubOption === 'mark-as'
                        ? styles.popoutOpen
                        : styles.popout
                    }
                  >
                    {collection.labels.map((label) => (
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
      <TrainButton />

      <ProfileDropDown profile={profile} />
    </div>
  )
}

const mapPropsToState = (state) => ({
  cosResources: state.resources.resources,
  activeCOSResource: state.resources.activeResource,
  wmlResourcesLoading: state.wmlResources.loading,
  wmlResources: state.wmlResources.resources,
  saving: state.editor.saving,
  imageRange: state.editor.range,
  collection: state.collection,
})
const mapDispatchToProps = {
  syncAction,
  setActiveImage,
  incrementSaving,
  decrementSaving,
  setActiveWMLResource,
  addModel,
  bootstrap,
}
export default connect(mapPropsToState, mapDispatchToProps)(AppBar)
