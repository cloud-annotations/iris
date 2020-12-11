import React, { useCallback, useEffect, useState } from 'react'

// @ts-ignore
import { useHistory } from 'react-router'

import { useSelector } from 'react-redux'

import styles from './dialog.module.css'
import { train } from './train'
import Warning from './Warning'
import Spinner from './Spinner'

const VALID_WML_REGIONS = ['us-south', 'eu-de']
const MINIMUM_EXAMPLE_COUNT = 20

interface Props {
  open: boolean
  onClose: () => any
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

async function getWMLInstance(id: string) {
  const res = await fetch(
    '/api/proxy/resource-controller.cloud.ibm.com/v2/resource_instances/' + id
  ).then((r) => r.json())
  return res
}

type Status =
  | 'idle'
  | 'pending-spaces'
  | 'pending-wml'
  | 'pending-training'
  | 'success-spaces'
  | 'success-wml'
  | 'success-training'
  | 'failed-spaces'
  | 'failed-wml'
  | 'failed-training'

function WMLDialog({ open, onClose }: Props) {
  const [chosenSpace, setChosenSpace] = useState<string>()
  const [wmlInstance, setWMLInstance] = useState<any>()

  const history = useHistory()

  const [status, setStatus] = useState<Status>('idle')

  const cosInstance = useSelector((state: any) =>
    state.resources.resources.find(
      (r: any) => r.id === state.resources.activeResource
    )
  )
  const notEnoughImages = useSelector(
    (state: any) =>
      !Object.values(state.collection.getLabelMapCount()).reduce(
        (acc, count) => acc && (count as number) >= MINIMUM_EXAMPLE_COUNT,
        true
      )
  )

  const [spaces, setSpaces] = useState<
    { id: string; name: string; status: string; compute: any }[]
  >([])

  useEffect(() => {
    setStatus('pending-spaces')
    getSpaces().then((r) => {
      if (r.length > 0) {
        setChosenSpace(r[0].id)
        setSpaces(r)
        setStatus('success-spaces')
        return
      }
      setStatus('failed-spaces')
      // https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/ml-spaces_local.html
    })
  }, [])

  useEffect(() => {
    setStatus('pending-wml')
    const space = spaces.find((s) => s.id === chosenSpace)
    if (space === undefined) {
      return
    }
    getWMLInstance(space.compute[0].guid).then((r) => {
      setWMLInstance(r)
      setStatus('success-wml')
    })
  }, [spaces, chosenSpace])

  const region = useSelector((state: any) => state.editor.location)
  const bucket = useSelector((state: any) => state.editor.bucket)

  const handlePrimary = useCallback(async () => {
    if (chosenSpace !== undefined) {
      setStatus('pending-training')
      const res = await train({
        spaceID: chosenSpace,
        bucket,
        region,
        cosInstance,
        wmlInstance,
      })
      setStatus('success-training')
      history.push(`/training?space=${chosenSpace}&id=${res.metadata.id}`)
    }
    onClose()
  }, [bucket, chosenSpace, cosInstance, history, onClose, region, wmlInstance])

  const handSelectChange = useCallback((e) => {
    setChosenSpace(e.target.value)
  }, [])

  const invalidRegion = !VALID_WML_REGIONS.includes(wmlInstance?.region_id)

  return (
    <div className={open ? styles.popupWrapper : styles.popupWrapperHidden}>
      <div className={styles.popup}>
        <div className={styles.wrapwrap}>
          <div className={styles.contentWrapper}>
            <div className={styles.popupTitle}>Start a training run</div>
            <div className={styles.popupBody}>
              Training will temporarily connect this bucket to the Watson
              Machine Learning service. Your images and annotations will be used
              to create your own personal model.
            </div>

            {(status === 'success-wml' || status === 'success-training') &&
              notEnoughImages && (
                <Warning title="Not enough examples per label">
                  Issues with training can occur when a label doesn't have at
                  least <strong>{MINIMUM_EXAMPLE_COUNT}</strong> examples.
                </Warning>
              )}

            {(status === 'success-wml' || status === 'success-training') &&
              invalidRegion && (
                <Warning title="The selected service doesn't support GPU usage">
                  Training a Cloud Annotations model requires a Watson Machine
                  Learning in either the region of <strong>Dallas</strong> or{' '}
                  <strong>Frankfurt</strong>.
                </Warning>
              )}

            {status === 'failed-spaces' && (
              <Warning title="No deployment spaces found">
                You can create a deployment space for free on IBM Cloud.
                <br />
                <a
                  className={styles.getStartedLink}
                  href="https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/ml-spaces_local.html?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </Warning>
            )}

            <div className={styles.popupFormItem}>
              <div className={styles.popupSelectLabelWrapper}>
                <label htmlFor="wml-select" className={styles.popupSelectLabel}>
                  Deployment Space
                </label>

                <div className={styles.popupSelectWrapper}>
                  <select
                    className={styles.popupSelect}
                    id="wml-select"
                    onChange={handSelectChange}
                    defaultValue={chosenSpace}
                  >
                    {spaces.map((r: any) => (
                      <option value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <svg
                    className={styles.popupSelectIcon}
                    focusable="false"
                    preserveAspectRatio="xMidYMid meet"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <Spinner
            loading={status.startsWith('pending')}
            label={
              status === 'pending-training'
                ? 'Submitting training run...'
                : 'Loading...'
            }
          />
        </div>
        <div className={styles.popupButtons}>
          <div className={styles.popupButtonSecondary} onClick={onClose}>
            Cancel
          </div>
          <div
            className={
              status === 'success-wml' || status === 'success-training'
                ? styles.popupButtonPrimary
                : styles.popupButtonPrimaryDissabled
            }
            onClick={handlePrimary}
          >
            Train
          </div>
        </div>
      </div>
    </div>
  )
}

export default WMLDialog
