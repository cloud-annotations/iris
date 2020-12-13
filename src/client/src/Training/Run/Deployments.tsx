import { formatDistance } from 'date-fns'
import React, { useEffect, useState } from 'react'
import StatusIcon from 'Training/StatusIcon'

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

  const items = [...pending, ...deployments]

  items.sort(
    (a, b) =>
      Date.parse(b.metadata.created_at) - Date.parse(a.metadata.created_at)
  )

  return (
    <div>
      <div className="ca--header">Deployments</div>
      {items.map((d: any) => {
        return (
          <div
            style={{
              border: '1px solid var(--listDivider)',
              display: 'flex',
              // justifyContent: 'space-between',
              padding: '16px',
              marginBottom: '8px',
              fontSize: '14px',
              // fontWeight: 500,
              lineHeight: 1.333,
            }}
          >
            <div style={{ flex: '2' }}>
              <a
                href={`https://dataplatform.cloud.ibm.com/ml-runtime/deployments/${d.metadata.id}?space_id=${d.entity.space_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {d.metadata.id}
              </a>
            </div>
            <div
              style={{
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <StatusIcon status={d.entity.status.state} />
              <div style={{ fontWeight: 500, marginLeft: '8px' }}>
                {d.entity.status.state}
              </div>
            </div>
            <div
              style={{
                flex: '1',
                textAlign: 'end',
              }}
            >
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
