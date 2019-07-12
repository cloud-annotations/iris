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

  // TODO: testing
  const [instanceList, setInstanceList] = useState([])
  const [chosenInstance, setChosenInstance] = useState('')

  const dispatchLoadBuckets = useCallback(
    async chosenInstance => {
      try {
        dispatch(await loadBuckets(chosenInstance))
      } catch (error) {
        console.error(error)
      }
    },
    [dispatch]
  )

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
          const account = json[0].accountId
          return fetch(`/api/upgrade-token?account=${account}`)
        })
        .then(() => {
          return fetch('/api/cos-instances')
        })
        .then(res => res.json())
        .then(json => {
          setInstanceList(json.resources)
          setChosenInstance(json.resources[0].id)
        })
    } catch (error) {
      console.log(error)
      if (error.message === 'Forbidden') {
        history.push('/login')
      }
    }
  }, [dispatchLoadBuckets])

  useEffect(() => {
    if (chosenInstance) {
      dispatchLoadBuckets(chosenInstance)
    }
  }, [chosenInstance, dispatchLoadBuckets])

  const handleRowSelected = useCallback(
    id => {
      const bucket = buckets.filter(bucket => bucket.id === id)[0]
      history.push(`/${bucket.name}?location=${bucket.location}`)
    },
    [buckets]
  )

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

      <>
        {instanceList.map(instance => {
          return <div>{instance.name}</div>
        })}
      </>

      <Table
        buckets={buckets}
        listOfLoadingBuckets={listOfLoadingBuckets}
        onDeleteBucket={handleDeleteBucket}
        onCreateBucket={handleCreateBucket}
        onRowSelected={handleRowSelected}
      />
    </div>
  )
}

const mapStateToProps = state => ({ buckets: state.buckets })
export default connect(mapStateToProps)(Buckets)
