import { formatDistance } from 'date-fns'
import React, { useEffect, useState } from 'react'

interface Props {
  run: any
  pending: any
}

function Deployments({ run, pending }: Props) {
  const [deployments, setDeployments] = useState<any>()

  useEffect(() => {
    setDeployments(undefined)
    let cancelled = false

    const region = 'us-south'

    fetch(
      `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/deployments?space_id=${run.entity.space_id}&tag.value=run:${run.metadata.id}&version=2020-09-01`
    )
      .then((r) => r.json())
      .then((r) => {
        if (!cancelled) {
          setDeployments(r.resources)
        }
      })

    return () => {
      cancelled = true
    }
  }, [run])

  if (deployments === undefined || deployments.length <= 0) {
    return null
  }

  return (
    <div>
      <div className="ca--header">Deployments</div>
      {pending.map((d: any) => {
        return (
          <div
            style={{
              border: '1px solid var(--listDivider)',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
              marginBottom: '8px',
            }}
          >
            <div>{d.metadata.id}</div>
            <div>{d.entity.status.state}</div>
            <div>
              {formatDistance(Date.parse(d.metadata.created_at), new Date()) +
                ' ago'}
            </div>
          </div>
        )
      })}
      {deployments.map((d: any) => {
        return (
          <div
            style={{
              border: '1px solid var(--listDivider)',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
              marginBottom: '8px',
            }}
          >
            <div>{d.metadata.id}</div>
            <div>{d.entity.status.state}</div>
            <div>
              {formatDistance(Date.parse(d.metadata.created_at), new Date()) +
                ' ago'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Deployments
