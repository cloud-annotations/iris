import React, { useCallback, useEffect, useState } from 'react'

import { formatDistance } from 'date-fns'

import Run from './Run'
import DropDown from 'common/DropDown/DropDown'

import queryString from 'query-string'

import { Redirect, useLocation } from 'react-router'

// @ts-ignore
import { Loading } from 'carbon-components-react'

// import dummyData from './dummy-data'

import styles from './styles.module.css'
import globalHistory from 'globalHistory'
import { useGoogleAnalytics } from 'googleAnalyticsHook'
import StatusIcon from './StatusIcon'

const PANEL_WIDTH = '323px'

const StatusListItem = ({ name, status, date }: any) => {
  const prettyDate = formatDistance(Date.parse(date), new Date()) + ' ago'

  return (
    <div className={styles.listItemTextBase}>
      <div className={styles.boop}>
        <StatusIcon status={status} />
        <div
          className={styles.clippedText}
          style={
            status === 'canceled' ? { color: 'var(--detailText)' } : undefined
          }
        >
          {name}
        </div>
      </div>
      <div className={styles.boop}>
        <div style={{ width: '14px', flexShrink: 0 }} />
        <div className={styles.clippedText2}>{prettyDate}</div>
      </div>
    </div>
  )
}

async function getSpaces() {
  const res = await fetch(
    '/api/proxy/api.dataplatform.cloud.ibm.com/v2/spaces'
  ).then((r) => r.json())

  // TODO: We should include these but put an error in the dialog that the space
  // doesn't have a WML instance associated.
  return res.resources
    .filter((r: any) => {
      if (r.entity.compute === undefined) {
        console.log(
          `WARNING: deployment space "${r.entity.name}" doesn't a WML instance associated`
        )
        return false
      }
      return r.entity.compute.length > 0
    })
    .map((r: any) => {
      return {
        id: r.metadata.id,
        name: r.entity.name,
        status: r.entity.status.state,
        compute: r.entity.compute,
      }
    })
}

function SpaceDropdown({ spaces, activeSpace, onSpaceChosen }: any) {
  return (
    <DropDown
      active={activeSpace?.name ?? ''}
      list={spaces.map((space: any) => ({
        display: space.name,
        id: space.id,
      }))}
      onChosen={onSpaceChosen}
      style={{
        margin: '0 16px',
        border: '1px solid #6f6f6f',
        // height: '48px',
        width: '100%',
        maxWidth: 'unset',
      }}
      listStyle={
        {
          // top: 0,
        }
      }
    />
  )
}

const MESSAGE = undefined

function proccessRuns(runs: any) {
  const sortedRuns = [...runs].sort(
    (a, b) =>
      Date.parse(b.metadata.created_at) - Date.parse(a.metadata.created_at)
  )

  const grouped: { [key: string]: any } = {}

  for (const run of sortedRuns) {
    grouped[run.entity.name] = run
  }
  return sortedRuns
}

function Training() {
  const [modelListStatus, setModelListStatus] = useState('idle')
  const [modelList, setModelList] = useState<any[]>([])
  const { search } = useLocation()
  const { id, space: spaceID } = queryString.parse(search)

  const [spaces, setSpaces] = useState<any[]>([])
  const sortedModelList = proccessRuns(modelList)

  const space = spaces.find((s) => s.id === spaceID)
  const run = sortedModelList.find((r) => r.metadata.guid === id)

  const resolvedSpaceID = space?.id ?? spaces?.[0]?.id
  const resolvedRunID =
    run?.metadata?.guid ?? sortedModelList?.[0]?.metadata?.guid

  const [spacesStatus, setSpacesStatus] = useState('idle')
  useEffect(() => {
    setSpacesStatus('pending')
    getSpaces().then((s) => {
      if (s.length > 0) {
        setSpaces(s)
        setSpacesStatus('success')
        return
      }
      setSpacesStatus('no-spaces')
    })
  }, [])

  useGoogleAnalytics('training')

  const handleModelChosen = useCallback(
    (model) => () => {
      globalHistory.replace(
        `/training?space=${resolvedSpaceID}&id=${model.metadata.guid}`
      )
    },
    [resolvedSpaceID]
  )

  const handleSpaceChosen = useCallback((space) => {
    globalHistory.replace(`/training?space=${space}`)
  }, [])

  useEffect(() => {
    // TODO: don't hardcode
    const region = 'us-south'
    if (resolvedSpaceID !== undefined) {
      setModelListStatus('pending')
      fetch(
        `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/trainings?space_id=${resolvedSpaceID}&version=2020-08-01&limit=100`
      )
        .then((r) => r.json())
        .then((r) => {
          setModelList(r.resources)
          setModelListStatus('success')
        })

      // // NOTE: DELETE ME
      // setTimeout(() => {
      //   setModelList(dummyData)
      //   setModelListStatus('success')
      // }, 1000)
    }
  }, [resolvedSpaceID])

  if (spacesStatus === 'no-spaces') {
    return (
      <div className={styles.noObjectStorage}>
        <div className={styles.noBucketsTitle} style={{ marginTop: '60px' }}>
          No deployment spaces
        </div>
        <div className={styles.noBucketsSub}>
          We use Watson Machine Learning, which requires a deployment space, to
          train your models. You can create a deployment space for free on IBM
          Cloud.
        </div>
        <a
          href="https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/ml-spaces_local.html?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.createBucket}
          style={{ height: '48px', marginTop: '40px' }}
        >
          <div className={styles.createBucketText}>Learn more</div>
        </a>
      </div>
    )
  }

  if (spacesStatus !== 'success') {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: -1,
        }}
      >
        <Loading className="small-loader" active withOverlay={false} />
      </div>
    )
  }

  let proposedSpaceID = resolvedSpaceID ?? spaceID
  let proposedRunID = resolvedRunID ?? id
  let query: { [key: string]: string } = {}
  if (proposedSpaceID !== undefined) {
    query.space = proposedSpaceID
  }
  if (proposedRunID !== undefined) {
    query.id = proposedRunID
  }

  if (proposedSpaceID !== spaceID || proposedRunID !== id) {
    return (
      <Redirect
        to={`/training?${queryString.stringify(query, { sort: false })}`}
      />
    )
  }

  return (
    <div>
      {MESSAGE && (
        <div
          style={{
            zIndex: 10,
            margin: '8px',
            position: 'absolute',
            right: 0,
            top: '64px',
            overflow: 'scroll',
            padding: `16px`,
            backgroundColor: 'var(--appBar)',
            border: '1px solid var(--textInputUnderline)',
          }}
        >
          {MESSAGE}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          width: PANEL_WIDTH,
          top: '113px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid var(--listDivider)',
          // borderBottom: '1px solid var(--listDivider)',
        }}
      >
        <SpaceDropdown
          spaces={spaces}
          activeSpace={space}
          onSpaceChosen={handleSpaceChosen}
        />
      </div>

      <React.Fragment>
        <div
          style={{
            position: 'absolute',
            width: PANEL_WIDTH,
            top: '193px',
            bottom: '0',
            overflow: 'scroll',
            // background: 'var(--secondaryBg)',
            // borderRight: '1px solid var(--border)',
            borderRight: '1px solid var(--listDivider)',
          }}
        >
          {modelListStatus !== 'success' ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <Loading className="small-loader" active withOverlay={false} />
            </div>
          ) : (
            sortedModelList.map((item) => (
              <div
                key={item.metadata.guid}
                onClick={handleModelChosen(item)}
                className={
                  item.metadata.guid === resolvedRunID
                    ? styles.listItemActive
                    : styles.listItem
                }
              >
                <StatusListItem
                  status={item.entity.status.state}
                  name={item.entity.name}
                  date={item.metadata.created_at}
                />
              </div>
            ))
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            left: PANEL_WIDTH,
            top: '112px',
            bottom: '0',
            overflow: 'scroll',
            width: `calc(100% - ${PANEL_WIDTH})`,
          }}
        >
          {run !== undefined && modelListStatus === 'success' && (
            <Run run={run} />
          )}
        </div>
      </React.Fragment>
    </div>
  )
}

export default Training
