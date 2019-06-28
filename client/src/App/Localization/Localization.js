import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { connect } from 'react-redux'

import HorizontalListController from 'common/HorizontalList/HorizontalListController'
import ImageTileV3 from 'common/ImageTile/ImageTileV3'
import LayersPanel from './LayersPanel'
import DefaultLayout from './DefaultLayout'
import ToolsPanel from './ToolsPanel'
import ToolOptionsPanel from './ToolOptionsPanel'
import fetchImage from 'api/fetchImage'
import Canvas from 'common/Canvas/Canvas'
import CrossHair from 'common/CrossHair/CrossHair'

const Localization = ({ bucket, collection }) => {
  const [selection, setSelection] = useState(0)
  const [imageData, setImageData] = useState(null)

  const handleSelectionChanged = useCallback(selection => {
    setSelection(selection)
  }, [])

  const images = collection.images.all

  const cells = useMemo(() => {
    return images.map(image => <ImageTileV3 bucket={bucket} item={image} />)
  }, [bucket, images])

  useEffect(() => {
    const image = images[selection]
    const loadImage = async image => {
      const imageData = await fetchImage(
        localStorage.getItem('loginUrl'),
        bucket,
        image,
        160
      )
      setImageData(imageData.image)
    }
    loadImage(image)
  }, [bucket, images, selection])

  const bboxes = collection.annotations[images[selection]] || []

  return (
    <DefaultLayout
      top={<ToolOptionsPanel />}
      left={<ToolsPanel />}
      content={
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            border: '1px solid var(--border)'
          }}
        >
          <CrossHair
            color={'#ff0000'}
            active={true}
            children={
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Canvas
                  mode={'box'}
                  bboxes={bboxes}
                  image={imageData}
                  // onDrawStarted={this.handleDrawStarted}
                  // onCoordinatesChanged={this.handleCoordinatesChanged}
                  // onBoxFinished={this.handleBoxFinished}
                  // onImageDimensionChanged={this.handleImageDimensionChanged}
                />
              </div>
            }
          />
        </div>
      }
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
