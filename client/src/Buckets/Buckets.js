import React, { useState, useEffect, useCallback } from 'react'
import GoogleAnalytics from 'react-ga'
import { connect } from 'react-redux'
import { loadBuckets } from 'redux/buckets'

import Table from './TableV2'
import CreateModal from './CreateModal'
import DeleteModal from './DeleteModal'
import DropDown, { ProfileDropDown } from 'common/DropDown/DropDown'
import COS from 'api/COSv2'
import { defaultEndpoint } from 'endpoints'

import history from 'globalHistory'
import styles from './Buckets.module.css'
import { setResources } from 'redux/resources'
import { setAccounts } from 'redux/accounts'

const accountNameForAccount = account => {
  if (account && account.softlayer) {
    return `${account.softlayer} - ${account.name}`
  } else if (account) {
    return account.name
  }
}

const Buckets = ({
  profile,
  buckets,
  resources,
  activeResource,
  accounts,
  activeAccount,
  dispatch
}) => {
  const [isCreateBucketModalOpen, setIsCreateBucketModalOpen] = useState(false)
  const [bucketToDelete, setBucketToDelete] = useState(false)

  const [listOfLoadingBuckets, setListOfLoadingBuckets] = useState([])

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
    if (activeResource) {
      dispatchLoadBuckets(activeResource)
    }
  }, [activeResource, dispatchLoadBuckets])

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
      dispatchLoadBuckets(activeResource)
      setIsCreateBucketModalOpen(false)
      history.push(`/${bucketName}`)
    },
    [activeResource, dispatchLoadBuckets]
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
      try {
        await new COS({ endpoint: defaultEndpoint }).deleteBucket({
          Bucket: bucketName
        })
      } catch (error) {
        console.error(error)
      }
      await dispatchLoadBuckets(activeResource)
      setListOfLoadingBuckets(list => list.filter(b => b !== bucketName))
    },
    [activeResource, dispatchLoadBuckets]
  )

  const handleAccountChosen = useCallback(
    item => {
      const activeAccount = accounts.find(
        account => accountNameForAccount(account) === item
      ).accountId
      console.log(activeAccount)
      dispatch(
        setAccounts({
          accounts: accounts,
          activeAccount: activeAccount
        })
      )
    },
    [accounts, dispatch]
  )

  const handleResourceChosen = useCallback(
    item => {
      const activeResource = resources.find(resource => resource.name === item)
        .id
      console.log(activeResource)
      dispatch(
        setResources({
          resources: resources,
          activeResource: activeResource
        })
      )
    },
    [dispatch, resources]
  )

  const activeAccountObject = accounts.find(
    account => activeAccount === account.accountId
  )

  const activeResourceObject = resources.find(
    resource => activeResource === resource.id
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBar}>
        <div className={styles.title}>
          <span className={styles.titlePrefix}>IBM</span>&nbsp;&nbsp;Cloud
          Annotations
        </div>
        <DropDown
          active={activeResourceObject && activeResourceObject.name}
          list={resources.map(resource => resource.name)}
          onChosen={handleResourceChosen}
        />
        <DropDown
          active={accountNameForAccount(activeAccountObject)}
          list={accounts.map(account => accountNameForAccount(account))}
          onChosen={handleAccountChosen}
        />
        <ProfileDropDown profile={profile} />
      </div>
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
        instanceId={activeResource}
      />
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

const mapStateToProps = state => ({
  resources: state.resources.resources,
  activeResource: state.resources.activeResource,
  accounts: state.accounts.accounts,
  activeAccount: state.accounts.activeAccount,
  buckets: state.buckets,
  profile: state.profile
})
export default connect(mapStateToProps)(Buckets)
