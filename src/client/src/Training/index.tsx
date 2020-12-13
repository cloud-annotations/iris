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

const PANEL_WIDTH = '323px'

const StatusListItem = ({ name, status, date }: any) => {
  const prettyDate = formatDistance(Date.parse(date), new Date()) + ' ago'
  if (status === 'completed') {
    return (
      <div className={styles.listItemTextBase}>
        <div className={styles.boop}>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 12 12"
            style={{ height: '14px', flexShrink: 0 }}
          >
            <path
              fill="#24a148"
              d="M6,0C2.7,0,0,2.7,0,6s2.7,6,6,6s6-2.7,6-6S9.3,0,6,0z"
            ></path>
            <polygon
              fill="#ffffff"
              points="5.2,8.2 3,6 3.8,5.2 5.2,6.8 8.2,3.8 9,4.5 "
            ></polygon>
          </svg>
          <div className={styles.clippedText}>{name}</div>
        </div>
        <div className={styles.boop}>
          <div style={{ width: '14px', flexShrink: 0 }} />
          <div className={styles.clippedText2}>{prettyDate}</div>
        </div>
      </div>
    )
  }
  if (status === 'error' || status === 'failed') {
    return (
      <div className={styles.listItemTextBase}>
        <div className={styles.boop}>
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            style={{ height: '14px', flexShrink: 0 }}
          >
            <rect
              x="14.9004"
              y="7.2004"
              width="2.1996"
              height="17.5994"
              transform="translate(-6.6275 16.0001) rotate(-45)"
              fill="#ffffff"
            />
            <path
              fill="#da1e28"
              d="M16,2A13.914,13.914,0,0,0,2,16,13.914,13.914,0,0,0,16,30,13.914,13.914,0,0,0,30,16,13.914,13.914,0,0,0,16,2Zm5.4449,21L9,10.5557,10.5557,9,23,21.4448Z"
            />
          </svg> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 12 12"
            style={{ height: '14px', flexShrink: 0 }}
          >
            <circle fill="#da1e28" cx="6" cy="6" r="6"></circle>
            <rect x="5" y="8" fill="#FFFFFF" width="2" height="2"></rect>
            <rect x="5" y="2" fill="#FFFFFF" width="2" height="4"></rect>
          </svg>
          <div className={styles.clippedText}>{name}</div>
        </div>
        <div className={styles.boop}>
          <div style={{ width: '14px', flexShrink: 0 }} />
          <div className={styles.clippedText2}>{prettyDate}</div>
        </div>
      </div>
    )
  }
  if (status === 'canceled') {
    return (
      <div className={styles.listItemTextBase}>
        <div className={styles.boop}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            style={{ height: '14px', flexShrink: 0 }}
          >
            <path
              fill="#6f6f6f"
              d="M29.4162,14.5905,17.41,2.5838a1.9937,1.9937,0,0,0-2.8192,0L2.5838,14.5905a1.9934,1.9934,0,0,0,0,2.819L14.5905,29.4162a1.9937,1.9937,0,0,0,2.8192,0L29.4162,17.41A1.9934,1.9934,0,0,0,29.4162,14.5905ZM21,18H11V14H21Z"
            />
          </svg>
          <div
            className={styles.clippedText}
            style={{ color: 'var(--detailText)' }}
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
  return (
    <div className={styles.listItemTextBase}>
      <div className={styles.boop}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          style={{ height: '14px', flexShrink: 0 }}
          fill="#f1c21b"
        >
          <rect x="22" y="20" width="8" height="2" />
          <rect x="22" y="24" width="8" height="2" />
          <rect x="22" y="28" width="8" height="2" />
          <rect x="18" y="24" width="2" height="2" />
          <rect x="18" y="20" width="2" height="2" />
          <rect x="18" y="28" width="2" height="2" />
          <path d="M6.8149,8.293A12.0777,12.0777,0,0,1,10.0068,5.62L9.0079,3.89A14.0845,14.0845,0,0,0,5.2841,7.0083Z" />
          <path d="M25.1851,8.293l1.5308-1.2847A14.0845,14.0845,0,0,0,22.9921,3.89l-.9989,1.73A12.0777,12.0777,0,0,1,25.1851,8.293Z" />
          <path d="M4.7366,11.9l-1.8772-.6831A13.9019,13.9019,0,0,0,2,16H4A11.917,11.917,0,0,1,4.7366,11.9Z" />
          <path d="M6.8149,23.707A11.9975,11.9975,0,0,1,4.7366,20.1l-1.8772.6831a13.99,13.99,0,0,0,2.4247,4.209Z" />
          <path d="M27.2634,11.9A11.917,11.917,0,0,1,28,16h2a13.8971,13.8971,0,0,0-.8594-4.7827Z" />
          <path d="M13.9182,27.8066A11.8894,11.8894,0,0,1,10.0068,26.38l-.9989,1.73a13.8673,13.8673,0,0,0,4.5633,1.664Z" />
          <path d="M13.9182,4.1934a11.3012,11.3012,0,0,1,4.1636,0l.347-1.9678a13.187,13.187,0,0,0-4.8576,0Z" />
        </svg>
        <div className={styles.clippedText}>{name}</div>
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
