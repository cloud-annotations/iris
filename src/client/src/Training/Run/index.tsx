import React, { useCallback, useEffect, useState } from 'react'

import styles from './styles.module.css'
import Errors from './Errors'
import Logs from './Logs'
import Deployments from './Deployments'
import { Divider, Tab, Tabs } from '@material-ui/core'

interface DeployOptions {
  runID: string
  spaceID: string
  storage: any
}

async function deployModel({ runID, spaceID, storage }: DeployOptions) {
  // TODO: don't hardcode region.
  const region = 'us-south'
  const bucket = storage.location.bucket
  const MODEL_PAYLOAD = {
    space_id: spaceID,
    name: bucket,
    // description: 'TF model to predict had-written digits',
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

  const res1 = await fetch(
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
    name: bucket,
    tags: [`run:${runID}`],
    // description: 'TF model to predict had-written digits',
    online: {},
    hardware_spec: { name: 'S' }, // NOTE: This is NOT random lol...
    asset: { id: res1.metadata.id },
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
}

const Training = ({ run }: Props) => {
  const projectName = run.entity.name
  const modelStatus = run.entity.status.state

  useEffect(() => {
    let color: string
    if (modelStatus === 'completed') {
      color = '-green'
    } else if (modelStatus === 'error' || modelStatus === 'failed') {
      color = '-red'
    } else if (modelStatus === 'running' || modelStatus === 'pending') {
      color = '-yellow'
    } else {
      // canceled
      color = ''
    }
    document.querySelectorAll('link[rel="icon"]').forEach((f) => {
      const favicon = f as HTMLLinkElement
      if (favicon.sizes.value === '32x32') {
        favicon.href = `${process.env.PUBLIC_URL}/favicon${color}-32x32.png`
      } else if (favicon.sizes.value === '16x16') {
        favicon.href = `${process.env.PUBLIC_URL}/favicon${color}-16x16.png`
      } else {
        favicon.href = `${process.env.PUBLIC_URL}/favicon${color}-32x32.png`
      }
    })
    return () => {
      // reset
      document.querySelectorAll('link[rel="icon"]').forEach((f) => {
        const favicon = f as HTMLLinkElement
        if (favicon.sizes.value === '32x32') {
          favicon.href = `${process.env.PUBLIC_URL}/favicon-32x32.png`
        } else if (favicon.sizes.value === '16x16') {
          favicon.href = `${process.env.PUBLIC_URL}/favicon-16x16.png`
        } else {
          favicon.href = `${process.env.PUBLIC_URL}/favicon-32x32.png`
        }
      })
    }
  }, [modelStatus])

  const [deployStatus, setDeployStatus] = useState('idle')

  const [pending, setPending] = useState<any[]>([])

  const deploy = useCallback(async () => {
    setDeployStatus('pending')
    const x = await deployModel({
      runID: run.metadata.id,
      spaceID: run.entity.space_id,
      storage: run.entity.results_reference,
    })
    setDeployStatus('idle')
    setPending([x, ...pending])
  }, [
    pending,
    run.entity.results_reference,
    run.entity.space_id,
    run.metadata.id,
  ])

  return (
    <div className={styles.wrapper}>
      <div className={styles.topInfoWrapper}>
        <div className={styles.title}>{projectName}</div>

        <div
          className={
            modelStatus === 'completed' && deployStatus !== 'pending'
              ? styles.button
              : styles.buttonDisabled
          }
          onClick={deploy}
        >
          <div className={styles.buttonText}>Deploy</div>
        </div>
      </div>

      <Tabs
        value={0}
        onChange={() => {}}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab
          label="Current"
          style={{
            minWidth: 0,
            paddingLeft: 12,
            paddingRight: 12,
          }}
        />
        {/* <Tab
          label="History"
          style={{
            minWidth: 0,
            paddingLeft: 12,
            paddingRight: 12,
          }}
        /> */}
      </Tabs>
      <Divider />

      <Deployments run={run} pending={pending} />

      <Errors failure={run?.entity?.status?.failure} />

      <Logs reference={run?.entity?.results_reference} />
    </div>
  )
}

export default React.memo(Training)
