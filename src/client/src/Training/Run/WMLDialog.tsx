import React, { useCallback, useState } from 'react'

import styles from './dialog.module.css'

import Spinner from './Spinner'

import pako from 'pako'
// @ts-ignore
import scoringFunction from './run.txt'

function inject(s: string, o: { [key: string]: string }) {
  for (const [key, val] of Object.entries(o)) {
    s = s.replace(new RegExp('\\${' + key + '}', 'g'), val)
  }
  return s
}

interface DeployOptions {
  runID: string
  spaceID: string
  storage: any
  apiKey: string
}

async function deployModel({ runID, spaceID, storage, apiKey }: DeployOptions) {
  const deployment = await deployModelCode({ spaceID, storage })

  // TODO: don't hardcode region.
  const region = 'us-south'
  const bucket = storage.location.bucket

  const FUNCTION_PAYLOAD = {
    space_id: spaceID,
    name: bucket,
    type: 'python',
    software_spec: { name: 'default_py3.7' },
  }

  const createFunction = await fetch(
    `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/functions?version=2020-08-01`,
    {
      body: JSON.stringify(FUNCTION_PAYLOAD),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  ).then((r) => r.json())

  const functionText = await fetch(scoringFunction).then((r) => r.text())

  const injected = inject(functionText, {
    API_KEY: apiKey,
    WML_ENDPOINT_URL: 'https://us-south.ml.cloud.ibm.com', // TODO: don't hard code
    BUCKET: bucket,
    LABELS_LOCATION: storage.location.model + '/labels.txt',
    COS_ACCESS_KEY_ID: storage.connection.access_key_id,
    COS_SECRET_ACCESS_KEY: storage.connection.secret_access_key,
    COS_ENDPOINT_URL: storage.connection.endpoint_url,
    SPACE_ID: spaceID,
    DEPLOYMENT_ID: deployment.metadata.id,
  })

  console.log(injected)

  const functionGZipped = pako.deflate(injected, {
    // @ts-ignore
    gzip: true,
    header: {
      text: true,
      name: 'run.py',
    },
  })

  await fetch(
    `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/functions/${createFunction.metadata.id}/code?space_id=${spaceID}&version=2020-08-01`,
    {
      body: functionGZipped,
      headers: {
        Accept: 'application/json',
      },
      method: 'PUT',
    }
  )

  const DEPLOYMENT_PAYLOAD = {
    space_id: spaceID,
    name: bucket,
    tags: [`run:${runID}`],
    online: {},
    hardware_spec: { name: 'S' }, // NOTE: This is NOT random lol...
    asset: { id: createFunction.metadata.id },
  }

  return await fetch(
    `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/deployments?version=2020-08-01`,
    {
      body: JSON.stringify(DEPLOYMENT_PAYLOAD),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  ).then((r) => r.json())
}

interface DeployCodeOptions {
  spaceID: string
  storage: any
}

async function deployModelCode({ spaceID, storage }: DeployCodeOptions) {
  // TODO: don't hardcode region.
  const region = 'us-south'
  const bucket = storage.location.bucket
  const MODEL_PAYLOAD = {
    space_id: spaceID,
    name: bucket,
    type: 'tensorflow_2.1',
    software_spec: { name: 'tensorflow_2.1-py3.7' },
    content_location: {
      type: 's3',
      contents: [
        {
          content_format: 'native',
          file_name: `${storage.location.logs}.zip`,
          location: `${storage.location.assets_path}${storage.location.training}/resources/wml_model/${storage.location.logs}.zip`,
        },
      ],
      connection: storage.connection,
      location: { bucket: bucket },
    },
  }

  const asset = await fetch(
    `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/models?version=2020-08-01`,
    {
      body: JSON.stringify(MODEL_PAYLOAD),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  ).then((r) => r.json())

  const DEPLOYMENT_PAYLOAD = {
    space_id: spaceID,
    name: bucket + '-raw',
    online: {},
    hardware_spec: { name: 'S' }, // NOTE: This is NOT random lol...
    asset: { id: asset.metadata.id },
  }

  return await fetch(
    `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/deployments?version=2020-08-01`,
    {
      body: JSON.stringify(DEPLOYMENT_PAYLOAD),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  ).then((r) => r.json())
}

interface Props {
  run: any
  open: boolean
  onClose: (deployment: any) => any
}

type Status = 'idle' | 'pending' | 'success' | 'failed'

function WMLDialog({ run, open, onClose }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handlePrimary = useCallback(async () => {
    setStatus('pending')

    const deployment = await deployModel({
      runID: run.metadata.id,
      spaceID: run.entity.space_id,
      storage: run.entity.results_reference,
      apiKey: apiKey,
    })

    setStatus('idle')
    onClose(deployment)
  }, [
    apiKey,
    onClose,
    run.entity.results_reference,
    run.entity.space_id,
    run.metadata.id,
  ])

  return (
    <div className={open ? styles.popupWrapper : styles.popupWrapperHidden}>
      <div className={styles.popup}>
        <div className={styles.wrapwrap}>
          <div className={styles.contentWrapper}>
            <div className={styles.popupTitle}>Deploy</div>
            <div className={styles.popupBody}>
              A platform API Key must be provided in order to connect an image
              pre-proccessing function to your model deployment. A platform API
              Key can be generated using the IBM Cloud CLI:
            </div>
            <pre>
              ibmcloud login
              <br />
              ibmcloud iam api-key-create API_KEY_NAME
            </pre>

            <div className={styles.popupFormItem}>
              <div className={styles.popupSelectLabelWrapper}>
                <label htmlFor="wml-input" className={styles.popupSelectLabel}>
                  Platform API Key
                </label>

                <div className={styles.popupSelectWrapper}>
                  <input
                    id="wml-input"
                    className={styles.popupSelect}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <Spinner loading={status === 'pending'} label="Deploying..." />
        </div>
        <div className={styles.popupButtons}>
          <div
            className={styles.popupButtonSecondary}
            onClick={() => {
              onClose(undefined)
            }}
          >
            Cancel
          </div>
          <div
            className={
              status !== 'pending'
                ? styles.popupButtonPrimary
                : styles.popupButtonPrimaryDissabled
            }
            onClick={handlePrimary}
          >
            Deploy
          </div>
        </div>
      </div>
    </div>
  )
}

export default WMLDialog
