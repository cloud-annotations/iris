import React from 'react'
import { connect } from 'react-redux'

import HorizontalListController from 'common/HorizontalList/HorizontalListController'
import ImageTileV2 from 'ImageTileV2'
import history from 'globalHistory'

const HorizontalListControllerDelegate = (
  handleImageSelected,
  images,
  bucket
) => {
  return {
    numberOfItems: images.length,
    keyForDataSet: images,
    keyForItemAt: index => images[index],
    cellForItemAt: (index, selected) => (
      <ImageTileV2
        index={index}
        onImageSelected={handleImageSelected}
        bucket={bucket}
        selected={selected}
        item={images[index]}
      />
    )
  }
}

const Localization = ({ bucket, collection }) => {
  return (
    <>
      Localization
      <HorizontalListController
        delegate={HorizontalListControllerDelegate(
          () => {},
          collection.images.all,
          bucket
        )}
        selection={0}
        onSelectionChanged={() => {}}
      />
    </>
  )
}

const mapStateToProps = state => ({ collection: state.collection })
export default connect(mapStateToProps)(Localization)
