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

  const cells = useMemo(() => {
    return images.map(image => <ImageTileV3 bucket={bucket} item={image} />)
  }, [bucket, images])

  // const cellForItem = useCallback(
  //   image => <ImageTileV3 bucket={bucket} item={image} />,
  //   [bucket]
  // )

  return (
    <>
      Localization
      <HorizontalListController
        items={images}
        cells={cells}
        selection={selection}
        onSelectionChanged={handleSelectionChanged}
      />
    </>
  )
}

const mapStateToProps = state => ({ collection: state.collection })
export default connect(mapStateToProps)(Localization)
