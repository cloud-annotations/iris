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
import { endpointForLocationConstraint } from 'endpoints'

const EMPTY_IMAGE =
  'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const useImage = (endpoint, bucket, image) => {
  const [imageData, setImageData] = useState(EMPTY_IMAGE)
  useEffect(() => {
    let canceled = false
    let loaded = false

    const loadImage = async image => {
      const imageData = await fetchImage(endpoint, bucket, image, false)
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

    loadImage(image)

    return () => {
      canceled = true
    }
  }, [endpoint, bucket, image])

  return imageData
}

const Localization = ({ bucket, location, collection }) => {
  const [selection, setSelection] = useState(0)
  const [tool, setTool] = useState('box')
  const [hoveredBox, setHoveredBox] = useState(undefined)

  const handleSelectionChanged = useCallback(selection => {
    setSelection(selection)
  }, [])

  const handleToolChosen = useCallback(tool => {
    setTool(tool)
  }, [])

  const handleBoxEnter = useCallback(box => {
    setHoveredBox(box)
  }, [])

  const handleBoxLeave = useCallback(() => {
    setHoveredBox(undefined)
  }, [])

  const images = collection.images.all
  const selectedImage = images[selection]

  const bboxes = collection.annotations[selectedImage] || []

  const endpoint = endpointForLocationConstraint(location)
  const imageData = useImage(endpoint, bucket, selectedImage)

  const cells = useMemo(() => {
    return images.map(image => (
      <ImageTileV3 endpoint={endpoint} bucket={bucket} item={image} />
    ))
  }, [endpoint, bucket, images])

  return (
    <DefaultLayout
      top={<ToolOptionsPanel />}
      left={<ToolsPanel tool={tool} onToolChosen={handleToolChosen} />}
      content={
        <DrawingPanel
          selectedImage={selectedImage}
          image={imageData}
          hoveredBox={hoveredBox}
        />
      }
      right={
        <LayersPanel
          imageName={selectedImage}
          bboxes={bboxes}
          image={imageData}
          onBoxEnter={handleBoxEnter}
          onBoxLeave={handleBoxLeave}
        />
      }
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
