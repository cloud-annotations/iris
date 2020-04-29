import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { connect } from 'react-redux'

import ImageTileV3 from 'common/ImageTile/ImageTileV3'
import LayersPanel from './LayersPanel'
import ImagesPanel from './ImagesPanel'
import DefaultLayout from './DefaultLayout'
import ToolsPanel from './ToolsPanel'
import ToolOptionsPanel from './ToolOptionsPanel'
import fetchImage from 'api/fetchImage'
import DrawingPanel from './DrawingPanel'
import { endpointForLocationConstraint } from 'endpoints'
import {
  setActiveImage,
  clearRange,
  ctlExpandRange,
  shiftExpandRange,
} from 'redux/editor'
import { useGoogleAnalytics } from 'googleAnalyticsHook'
import AutoLabelPanel from './AutoLabelPanel'
import SplitLayout from './SplitLayout'
import ThumbnailThing from './ThumbnailThing'

const EMPTY_IMAGE =
  'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const useImage = (endpoint, bucket, image) => {
  const [imageData, setImageData] = useState(EMPTY_IMAGE)
  useEffect(() => {
    let canceled = false
    let loaded = false

    const loadImage = async (imageToLoad) => {
      const imageData = await fetchImage(endpoint, bucket, imageToLoad, false)
      if (!canceled && image === imageToLoad) {
        loaded = true
        setImageData(imageData.image)
      }
    }

    // If the image hasn't loaded after 20ms it probably isn't cached, so set it
    // to an empty image. This prevents flickering if the image is cached, but
    // wipes the image fast enough if it's not cached.
    setTimeout(() => {
      if (!canceled && !loaded) {
        setImageData(EMPTY_IMAGE)
      }
    }, 20)

    if (image) {
      loadImage(image)
    }

    return () => {
      canceled = true
    }
  }, [endpoint, bucket, image])

  return imageData
}

const Localization = ({
  bucket,
  location,
  collection,
  activeImage,
  setActiveImage,
  shiftExpandRange,
  ctlExpandRange,
  // setPredictions,
  clearRange,
  model,
  range,
}) => {
  const [imageFilter, setImageFilter] = useState(undefined)
  const [autoLabelMode, setAutoLabelMode] = useState(false)

  useGoogleAnalytics('localization')

  const images =
    imageFilter === undefined
      ? collection.images
      : collection.getLabeledImages(imageFilter)

  const handleImageFilterChange = useCallback(
    (e) => {
      switch (e.target.value) {
        case 'all':
          setImageFilter(undefined)
          break
        case 'labeled':
          setImageFilter(true)
          break
        case 'unlabeled':
          setImageFilter(false)
          break
        default:
          setImageFilter(e.target.value)
          break
      }
      setActiveImage(undefined)
    },
    [setActiveImage]
  )

  const handleSelectionChanged = useCallback(
    (selection, key) => {
      if (key.shiftKey) {
        // later...
      } else if (key.ctrlKey) {
        ctlExpandRange(images[selection])
      } else {
        setActiveImage(images[selection])
      }
    },
    [ctlExpandRange, images, setActiveImage]
  )

  const handleNextImage = useCallback(() => {
    const nextIndex = images.indexOf(activeImage) + 1
    if (nextIndex < images.length) {
      setActiveImage(images[nextIndex])
    }
  }, [activeImage, images, setActiveImage])

  useEffect(() => {
    if (!activeImage && images.length > 0) {
      setActiveImage(images[0])
    }
  }, [activeImage, images, setActiveImage])

  const handleExpandAutoLabel = useCallback(() => {
    setAutoLabelMode(true)
  }, [])

  const handleCollapseAutoLabel = useCallback(() => {
    setAutoLabelMode(false)
  }, [])

  const selectedIndex = images.indexOf(activeImage)
  const rangeIndex = range.map((image) => images.indexOf(image))

  const rawAnnotationsForImage = collection.annotations[activeImage] || []
  const bboxes = rawAnnotationsForImage.filter(
    (box) =>
      box.x !== undefined &&
      box.y !== undefined &&
      box.x2 !== undefined &&
      box.y2 !== undefined
  )

  const endpoint = endpointForLocationConstraint(location)
  const imageData = useImage(endpoint, bucket, activeImage)

  const cells = useMemo(() => {
    return images.map((image) => {
      if (
        imageFilter !== true &&
        imageFilter !== false &&
        imageFilter !== undefined
      ) {
        const bboxes = collection.annotations[image].filter(
          (b) => b.label === imageFilter
        )
        console.log(bboxes)
        if (bboxes.length > 0) {
          return (
            <ThumbnailThing
              bboxes={bboxes}
              image={image}
              endpoint={endpoint}
              bucket={bucket}
            />
          )
        } else {
          return <></>
        }
      } else {
        return <ImageTileV3 endpoint={endpoint} bucket={bucket} item={image} />
      }
    })
  }, [bucket, collection.annotations, endpoint, imageFilter, images])

  const mapOfLabelCount = collection.getLabelMapCount()

  return (
    <DefaultLayout
      top={<ToolOptionsPanel />}
      left={<ToolsPanel />}
      content={<DrawingPanel selectedImage={activeImage} image={imageData} />}
      right={
        <SplitLayout
          expandBottom={autoLabelMode && model !== undefined}
          top={
            <LayersPanel
              imageName={activeImage}
              bboxes={bboxes}
              image={imageData}
            />
          }
          bottom={
            <AutoLabelPanel
              expanded={autoLabelMode}
              onExpand={handleExpandAutoLabel}
              onCollapse={handleCollapseAutoLabel}
              onNextImage={handleNextImage}
            />
          }
        />
      }
      bottom={
        <ImagesPanel
          allImageCount={collection.images.length}
          images={images}
          labels={mapOfLabelCount}
          imageFilter={imageFilter}
          handleImageFilterChange={handleImageFilterChange}
          cells={cells}
          range={rangeIndex}
          selectedIndex={selectedIndex}
          handleSelectionChanged={handleSelectionChanged}
        />
      }
    />
  )
}

const mapStateToProps = (state) => ({
  collection: state.collection,
  activeImage: state.editor.image,
  range: state.editor.range,
  model: state.autoLabel.model,
})

const mapDispatchToProps = {
  setActiveImage,
  shiftExpandRange,
  ctlExpandRange,
  clearRange,
  // setPredictions
}
export default connect(mapStateToProps, mapDispatchToProps)(Localization)
