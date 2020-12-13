import React, { useEffect, useState } from 'react'

import styles from './styles.module.css'
import Errors from './Errors'
import Logs from './Logs'
import Deployments from './Deployments'
import { Divider, Tab, Tabs } from '@material-ui/core'

import WMLDialog from './WMLDialog'

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

  const [pending, setPending] = useState<any[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className={styles.wrapper}>
      <div className={styles.topInfoWrapper}>
        <div className={styles.title}>{projectName}</div>

        <div
          className={
            modelStatus === 'completed' ? styles.button : styles.buttonDisabled
          }
          onClick={() => {
            setDialogOpen(true)
          }}
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

      <WMLDialog
        run={run}
        open={dialogOpen}
        onClose={(deployment) => {
          if (deployment !== undefined) {
            setPending([deployment, ...pending])
          }
          setDialogOpen(false)
        }}
      />
    </div>
  )
}

export default React.memo(Training)
