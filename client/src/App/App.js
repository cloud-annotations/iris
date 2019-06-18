import React, { useEffect, useState, useCallback } from 'react'
import { connect } from 'react-redux'
import { Loading } from 'carbon-components-react'

import history from 'globalHistory'
import { loadCollection, clearCollection } from 'redux/collection'
import Localization from './Localization/Localization'
import Classification from './Classification/Classification'
import endpointFinder from './endpointFinder'
import ChooseBucketModal from './ChooseBucketModal'

const AnnotationPanel = ({ type }) => {
  switch (type) {
    case 'classification':
      return <Classification />
    case 'localization':
      return <Localization />
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

  const handleSubmit = useCallback(() => {}, [])

  return (
    <>
      <ChooseBucketModal
        isOpen={!loading && !type}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      <Loading active={loading} />
      <AnnotationPanel type={type} />
    </>
  )
}

const mapStateToProps = state => ({ type: state.collection.type })
export default connect(mapStateToProps)(App)
