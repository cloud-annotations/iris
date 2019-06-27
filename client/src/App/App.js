import React, { useEffect, useState, useCallback } from 'react'
import { connect } from 'react-redux'
import { Loading } from 'carbon-components-react'

import history from 'globalHistory'
import {
  loadCollection,
  clearCollection,
  setCollectionType
} from 'redux/collection'
import Localization from './Localization/Localization'
import Classification from './Classification/Classification'
import endpointFinder from './endpointFinder'
import ChooseBucketModal from './ChooseBucketModal'
import AppBar from './AppBar'
import AppBarLayout from './AppBarLayout'

const AnnotationPanel = ({ bucket, type }) => {
  switch (type) {
    case 'classification':
      return <Classification />
    case 'localization':
      return <Localization bucket={bucket} />
    default:
      return null
  }
}

const App = ({
  match: {
    params: { bucket }
  },
  dispatch,
  type
}) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(0)

  useEffect(() => {
    const asyncEffect = async () => {
      try {
        dispatch(await loadCollection(bucket))
      } catch (error) {
        console.error(error)
        if (error.message === 'Forbidden') {
          history.push('/login')
          return
        }
        await endpointFinder(bucket)
      }
      setLoading(false)
    }
    asyncEffect()
    return () => dispatch(clearCollection())
  }, [bucket, dispatch])

  const handleClose = useCallback(() => {
    history.push('/')
  }, [])

  const handleSubmit = useCallback(
    async choice => {
      setSaving(s => s + 1)
      dispatch(
        setCollectionType(choice, () => {
          setSaving(s => s - 1)
        })
      )
    },
    [dispatch]
  )

  return (
    <>
      <ChooseBucketModal
        isOpen={!loading && !type}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <Loading active={loading} />
      <AppBarLayout
        appBar={<AppBar />}
        content={<AnnotationPanel bucket={bucket} type={type} />}
      />
    </>
  )
}

const mapStateToProps = state => ({ type: state.collection.type })
export default connect(mapStateToProps)(App)
