import React, { useState, useEffect, useCallback } from 'react'
import GoogleAnalytics from 'react-ga'
import { connect } from 'react-redux'
import { loadBuckets } from 'redux/buckets'

import Table from './Table'
import CreateModal from './CreateModal'
import DeleteModal from './DeleteModal'
import { checkLoginStatus } from 'Utils'
import COS from 'api/COSv2'

import history from 'globalHistory'
import styles from './Buckets.module.css'

const Buckets = ({ buckets, dispatch }) => {
  const [isCreateBucketModalOpen, setIsCreateBucketModalOpen] = useState(false)
  const [bucketToDelete, setBucketToDelete] = useState(false)

  const [listOfLoadingBuckets, setListOfLoadingBuckets] = useState([])

  const dispatchLoadBuckets = useCallback(async () => {
    try {
      // dispatch(await loadBuckets())
    } catch (error) {
      console.error(error)
    }
  }, [dispatch])

  useEffect(() => {
    GoogleAnalytics.pageview('buckets')
  }, [])

  useEffect(() => {
    try {
      checkLoginStatus()
      dispatchLoadBuckets()
      fetch('/api/accounts')
        .then(res => res.json())
        .then(json => {
          console.log(json)
          const account = json[0].accountId
          return fetch(`/api/upgrade-token?account=${account}`)
        })
        .then(() => {
          console.log('done')
          return fetch('/api/cos-instances')
        })
        .then(res => res.json())
        .then(json => {
          console.log(json)
          const cos = new COS({
            endpoint: 's3.us-west.cloud-object-storage.test.appdomain.cloud'
          })
          return cos.listBuckets({
            IBMServiceInstanceId: json.resources[0].id
          })
        })
        .then(json => {
          console.log(json)
        })
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
      setIsCreateBucketModalOpen(false)
      history.push(`/${bucketName}`)
    },
    [dispatchLoadBuckets]
  )

  const handleDeleteBucket = useCallback(bucketName => {
    setBucketToDelete(bucketName)
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setBucketToDelete(false)
  }, [])

  const handleSubmitDeleteModal = useCallback(
    async bucketName => {
      setBucketToDelete(false)
      setListOfLoadingBuckets(list => [...list, bucketName])
      const endpoint = localStorage.getItem('loginUrl')
      try {
        await new COS(endpoint).deleteBucket(bucketName)
      } catch (error) {
        console.error(error)
      }
      await dispatchLoadBuckets()
      setListOfLoadingBuckets(list => list.filter(b => b !== bucketName))
    },
    [dispatchLoadBuckets]
  )

  return (
    <div className={styles.wrapper}>
      <DeleteModal
        isOpen={bucketToDelete}
        onClose={handleCloseDeleteModal}
        onSubmit={handleSubmitDeleteModal}
        itemToDelete={bucketToDelete}
      />
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
