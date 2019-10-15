import React, { useState, useEffect, useCallback } from 'react'
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
import { setActiveResource } from 'redux/resources'
import { setActiveAccount } from 'redux/accounts'
import { useGoogleAnalytics } from 'googleAnalyticsHook'

const accountNameForAccount = account => {
  if (account && account.softlayer) {
    return `${account.softlayer} - ${account.name}`
  } else if (account) {
    return account.name
  }
}

const ConditionalTable = connect(state => ({
  resources: state.resources.resources,
  loadingResources: state.resources.loading,
  accounts: state.accounts.accounts,
  loadingAccounts: state.accounts.loading,
  buckets: state.buckets
}))(
  ({
    loadingAccounts,
    accounts,
    loadingResources,
    resources,
    buckets,
    listOfLoadingBuckets,
    handleDeleteBucket,
    handleCreateBucket,
    handleRowSelected,
    loading
  }) => {
    if (!loadingAccounts && accounts.length === 0) {
      return (
        <div className={styles.noObjectStorage}>
          <div className={styles.noBucketsTitle} style={{ marginTop: '60px' }}>
            Account not yet activated
          </div>
          <div className={styles.noBucketsSub}>
            Your IBM Cloud account hasn't been activated yet. You can activate
            your account by logging into{' '}
            <a
              className={styles.getStartedLink}
              href="https://cloud.ibm.com?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
              target="_blank"
              rel="noopener noreferrer"
            >
              IBM Cloud
            </a>
            . Once activated, refresh this page.
          </div>
          <a
            href="https://cloud.ibm.com?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.createBucket}
            style={{ height: '48px', marginTop: '40px' }}
          >
            <div className={styles.createBucketText}>Activate your account</div>
          </a>
        </div>
      )
    }

    if (!loadingResources && resources.length === 0) {
      return (
        <div className={styles.noObjectStorage}>
          <div className={styles.noBucketsTitle} style={{ marginTop: '60px' }}>
            No Object Storage instance
          </div>
          <div className={styles.noBucketsSub}>
            We use object storage to save your annotations. You can create an
            Object Storage instance for free on{' '}
            <a
              className={styles.getStartedLink}
              href="https://cloud.ibm.com/catalog/services/cloud-object-storage?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
              target="_blank"
              rel="noopener noreferrer"
            >
              IBM Cloud
            </a>
            . Once created, refresh this page.
          </div>
          <a
            href="https://cloud.ibm.com/catalog/services/cloud-object-storage?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.createBucket}
            style={{ height: '48px', marginTop: '40px' }}
          >
            <div className={styles.createBucketText}>Get started</div>
          </a>
        </div>
      )
    }

    return (
      <Table
        buckets={buckets}
        listOfLoadingBuckets={listOfLoadingBuckets}
        onDeleteBucket={handleDeleteBucket}
        onCreateBucket={handleCreateBucket}
        onRowSelected={handleRowSelected}
        loading={loading}
      />
    )
  }
)

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
  const [loading, setLoading] = useState(false)

  const [listOfLoadingBuckets, setListOfLoadingBuckets] = useState([])

  const dispatchLoadBuckets = useCallback(
    async chosenInstance => {
      try {
        // We only want to show the loading indicator when we first load the
        // page. Don't `setLoading(true)`
        dispatch(await loadBuckets(chosenInstance))
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    },
    [dispatch]
  )

  useGoogleAnalytics('buckets')

  useEffect(() => {
    // Loading until activeResource is ready.
    if (!buckets) {
      setLoading(true)
    }
  }, [buckets])

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
      history.push(`/${bucketName}?location=us`)
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
        const cos = new COS({ endpoint: defaultEndpoint })

        // Recursively delete 1000 objects at time.
        const deleteAllObjects = async () => {
          const res = await cos.listObjectsV2({ Bucket: bucketName })
          const { Contents = [] } = res.ListBucketResult
          const contents = Array.isArray(Contents) ? Contents : [Contents]
          const objects = contents.map(item => ({ Key: item.Key }))
          if (objects.length > 0) {
            await cos.deleteObjects({
              Bucket: bucketName,
              Delete: {
                Objects: objects
              }
            })
            await deleteAllObjects()
          }
          return
        }

        await deleteAllObjects()

        await cos.deleteBucket({
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
      dispatch(setActiveAccount(item))
    },
    [dispatch]
  )

  const handleResourceChosen = useCallback(
    item => {
      dispatch(setActiveResource(item))
    },
    [dispatch]
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
          list={resources.map(resource => ({
            display: resource.name,
            id: resource.id
          }))}
          onChosen={handleResourceChosen}
        />
        <DropDown
          active={accountNameForAccount(activeAccountObject)}
          list={accounts.map(account => ({
            display: accountNameForAccount(account),
            id: account.accountId
          }))}
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
      <ConditionalTable
        listOfLoadingBuckets={listOfLoadingBuckets}
        handleDeleteBucket={handleDeleteBucket}
        handleCreateBucket={handleCreateBucket}
        handleRowSelected={handleRowSelected}
        loading={loading}
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
