import React, { useState, useEffect, useCallback } from 'react'
import GoogleAnalytics from 'react-ga'
import { connect } from 'react-redux'
import { loadBuckets } from 'redux/buckets'

import Table from './Table'
import CreateModal from './CreateModal'
import DeleteModal from './DeleteModal'
import { validateCookies } from 'Utils'

import history from 'globalHistory'
import styles from './Buckets.module.css'

const Buckets = ({ buckets, dispatch }) => {
  const [isCreateBucketModalOpen, setIsCreateBucketModalOpen] = useState(false)
  const [isDeleteBucketModalOpen, setIsDeleteBucketModalOpen] = useState(false)
  const [bucketToDelete, setBucketToDelete] = useState('')

  const [listOfLoadingBuckets, setListOfLoadingBuckets] = useState([])

  const dispatchLoadBuckets = useCallback(async () => {
    dispatch(await loadBuckets())
  }, [dispatch])

  useEffect(() => {
    GoogleAnalytics.pageview('buckets')
  }, [])

  useEffect(() => {
    try {
      validateCookies()
      dispatchLoadBuckets()
    } catch (error) {
      console.log(error)
      if (error.message === 'Forbidden') {
        history.push('/login')
      }
    }
  }, [dispatchLoadBuckets])

  const handleCreateBucket = useCallback(() => {
    setIsCreateBucketModalOpen(true)
  }, [])

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateBucketModalOpen(false)
  }, [])

  const handleSubmitCreateModal = useCallback(
    bucketName => {
      dispatchLoadBuckets()
      handleCloseCreateModal()
      history.push(`/${bucketName}`)
    },
    [dispatchLoadBuckets, handleCloseCreateModal]
  )

  const handleDeleteBucket = useCallback(bucketName => {
    setIsDeleteBucketModalOpen(true)
  }, [])

  const closeDeleteBucketModal = useCallback(() => {
    setIsDeleteBucketModalOpen(false)
  }, [])

  return (
    <div className={styles.wrapper}>
      {/* <DeleteModal
        isOpen={isCreateBucketModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmitCreateModal}
        itemToDelete={bucketToDelete}
      /> */}
      <CreateModal
        isOpen={isCreateBucketModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmitCreateModal}
      />
      <Table
        buckets={buckets}
        listOfLoadingBuckets={listOfLoadingBuckets}
        onDeleteBucket={handleDeleteBucket}
        onCreateBucket={handleCreateBucket}
      />
    </div>
  )
}

const mapStateToProps = state => ({ buckets: state.buckets })
export default connect(mapStateToProps)(Buckets)
