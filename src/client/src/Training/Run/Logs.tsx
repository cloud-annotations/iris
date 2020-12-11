import { endpointFromRegion, regionFromEndpoint } from 'endpoints'
import React, { useEffect, useState } from 'react'

interface Props {
  reference: any
}

function Logs({ reference }: Props) {
  const [logs, setLogs] = useState<any>()

  useEffect(() => {
    setLogs(undefined)
    let cancelled = false
    const region = regionFromEndpoint(reference?.connection.endpoint_url)
    const url =
      '/api/proxy/' +
      endpointFromRegion(region) +
      '/' +
      reference?.location.bucket +
      '/' +
      reference?.location.logs +
      '/training-log.txt'

    fetch(url)
      .then((r) => {
        if (r.ok) {
          return r.text()
        }
        return undefined
      })
      .then((l) => {
        if (!cancelled) {
          setLogs(l)
        }
      })

    return () => {
      cancelled = true
    }
  }, [reference])

  if (reference === undefined) {
    return null
  }

  if (logs === undefined) {
    return null
  }

  return (
    <div>
      <div className="ca--header">Logs</div>
      <pre>{logs}</pre>
    </div>
  )
}

export default Logs
