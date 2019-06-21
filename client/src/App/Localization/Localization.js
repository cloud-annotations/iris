import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'

import HorizontalListController from 'common/HorizontalList/HorizontalListController'
import ImageTileV3 from 'common/ImageTile/ImageTileV3'

const Localization = ({ bucket, collection }) => {
  const [selection, setSelection] = useState(0)
  const handleSelectionChanged = useCallback(selection => {
    setSelection(selection)
  }, [])

  const images = collection.images.all

  // const keyForItemAt = useCallback(
  //   index => {
  //     return images[index]
  //   },
  //   [images]
  // )

  const cellForItem = useCallback(
    image => {
      return (
        <ImageTileV3
          // index={index}
          bucket={bucket}
          item={image}
          // item={images[index]}
          // selected={selected}
        />
      )
    },
    [bucket]
  )

  return (
    <>
      Localization
      <HorizontalListController
        // numberOfItems={images.length}
        images={images}
        // keyForItemAt={keyForItemAt}
        cellForItem={cellForItem}
        selection={selection}
        onSelectionChanged={handleSelectionChanged}
      />
    </>
  )
}

const mapStateToProps = state => ({ collection: state.collection })
export default connect(mapStateToProps)(Localization)
