import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { connect } from 'react-redux'

import HorizontalListController from 'common/HorizontalList/HorizontalListController'
import ImageTileV3 from 'common/ImageTile/ImageTileV3'
import LayersPanel from './LayersPanel'
import DefaultLayout from './DefaultLayout'
import ToolsPanel from './ToolsPanel'
import ToolOptionsPanel from './ToolOptionsPanel'
import fetchImage from 'api/fetchImage'
import DrawingPanel from './DrawingPanel'

const EMPTY_IMAGE =
  'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const Localization = ({ bucket, collection }) => {
  const [selection, setSelection] = useState(0)
  const [imageData, setImageData] = useState(EMPTY_IMAGE)

  const handleSelectionChanged = useCallback(selection => {
    setSelection(selection)
  }, [])

  const images = collection.images.all

  const cells = useMemo(() => {
    return images.map(image => <ImageTileV3 bucket={bucket} item={image} />)
  }, [bucket, images])

  useEffect(() => {
    let canceled = false
    let loaded = false

    const loadImage = async image => {
      const imageData = await fetchImage(
        localStorage.getItem('loginUrl'),
        bucket,
        image,
        false
      )
      if (!canceled) {
        loaded = true
        setImageData(imageData.image)
      }
    }

    // If the image hasn't loaded after 20ms it probably isn't cached, so set it
    // to and empty image. This prevents flickering if the image is cached, but
    // wipes the image fast enough if it's not cached.
    setTimeout(() => {
      if (!loaded) {
        setImageData(EMPTY_IMAGE)
      }
    }, 20)

    loadImage(images[selection])

    return () => {
      canceled = true
    }
  }, [bucket, images, selection])

  const bboxes = collection.annotations[images[selection]] || []

  return (
    <DefaultLayout
      top={<ToolOptionsPanel />}
      left={<ToolsPanel />}
      content={<DrawingPanel bboxes={bboxes} image={imageData} />}
      right={<LayersPanel bboxes={bboxes} image={imageData} />}
      bottom={
        <HorizontalListController
          items={images}
          cells={cells}
          selection={selection}
          onSelectionChanged={handleSelectionChanged}
        />
      }
    />
  )
}

const mapStateToProps = state => ({ collection: state.collection })
export default connect(mapStateToProps)(Localization)
