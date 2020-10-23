import React, { useState, useCallback } from 'react'
import { connect } from 'react-redux'

import DefaultLayout from './DefaultLayout'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import GridPanel from './GridPanel'
import { useGoogleAnalytics } from 'googleAnalyticsHook'
import { endpointForLocationConstraint } from 'endpoints'

const Classification = ({ bucket, location, collection }) => {
  useGoogleAnalytics('classification')

  const [rawSection, setSection] = useState(ALL_IMAGES)

  // TODO: This should use the editor redux.
  const [selection, setSelection] = useState([])

  const mapOfLabelCount = collection.getLabelMapCount()
  const groupedImages = collection.getGroupedImages()
  const allImagesCount = groupedImages.all.length
  const labeledCount = groupedImages.labeled.length
  const unlabeledCount = groupedImages.unlabeled.length
  const endpoint = endpointForLocationConstraint(location)

  const handleSectionChanged = useCallback(s => {
    setSelection([])
    setSection(s)
  }, [])

  const handleSelectionChanged = useCallback(s => {
    setSelection(s)
  }, [])

  // ensure section exists.
  // i.e. when the current section is deleted.
  const section =
    [ALL_IMAGES, UNLABELED, LABELED, ...collection.labels].find(
      i => i === rawSection
    ) || ALL_IMAGES

  return (
    <DefaultLayout
      left={
        <Sidebar
          currentSection={section}
          allImagesCount={allImagesCount}
          labeledCount={labeledCount}
          unlabeledCount={unlabeledCount}
          labels={mapOfLabelCount}
          onSectionChanged={handleSectionChanged}
        />
      }
      content={
        <GridPanel
          selection={selection}
          onSelectionChange={handleSelectionChanged}
          bucket={bucket}
          endpoint={endpoint}
          section={section}
          groupedImages={groupedImages}
          labels={Object.keys(mapOfLabelCount)}
        />
      }
    />
  )
}

const mapStateToProps = state => ({ collection: state.collection })
const mapDispatchToProps = {}
export default connect(mapStateToProps, mapDispatchToProps)(Classification)
