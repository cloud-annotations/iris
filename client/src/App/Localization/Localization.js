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
    // to an empty image. This prevents flickering if the image is cached, but
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
  const [imageFilter, setImageFilter] = useState(undefined)

  const handleSelectionChanged = useCallback(selection => {
    setSelection(selection)
  }, [])

  const handleImageFilterChange = useCallback(e => {
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
        break
    }
  }, [])

  // TODO: Use image name instead of index as the `selection` so we can easily
  // inject the current image into the list.
  const images =
    imageFilter === undefined
      ? collection.images
      : collection.getLabeledImages(imageFilter)
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
      left={<ToolsPanel />}
      content={<DrawingPanel selectedImage={selectedImage} image={imageData} />}
      right={
        <LayersPanel
          imageName={selectedImage}
          bboxes={bboxes}
          image={imageData}
        />
      }
      bottom={
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            top: 0,
            background: 'var(--secondaryBg)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: '272px',
              left: '50px',
              height: '28px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--toolBarSpacer)',
              userSelect: 'none'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                width: '130px',
                height: '28px',
                display: 'flex',
                zIndex: -1,
                alignItems: 'center',
                justifyContent: 'flex-end',
                fontFamily:
                  "'ibm-plex-sans', Helvetica Neue, Arial, sans-serif",
                fontWeight: 500,
                fontSize: '12px',
                color: 'var(--detailText)',
                paddingRight: '10px'
              }}
            >
              {images.length.toLocaleString()}
            </div>
            <select
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                marginLeft: '6px',
                width: '130px',
                fontFamily:
                  "'ibm-plex-sans', Helvetica Neue, Arial, sans-serif",
                fontWeight: 500,
                fontSize: '12px',
                color: 'var(--brightText)',
                cursor: 'pointer'
              }}
              onChange={handleImageFilterChange}
            >
              <option value="all">All Images</option>
              <option value="labeled">Labeled</option>
              <option value="unlabeled">Unlabeled</option>
            </select>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              height: '113px'
            }}
          >
            <HorizontalListController
              items={images}
              cells={cells}
              selection={selection}
              onSelectionChanged={handleSelectionChanged}
            />
          </div>
        </div>
      }
    />
  )
}

const mapStateToProps = state => ({
  collection: state.collection
})
export default connect(mapStateToProps)(Localization)
