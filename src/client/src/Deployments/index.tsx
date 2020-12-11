import React, { useEffect } from 'react'

// @ts-ignore
import { Loading } from 'carbon-components-react'

function Deployments() {
  useEffect(() => {
    const region = 'us-south'
    const spaceID = '9594ac58-e503-4e9a-ba86-7c25ab1d4de7'
    // asset_id
    fetch(
      `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/deployments?space_id=${spaceID}&version=2020-09-01`
    )
      .then((r) => r.json())
      .then((r) => {
        console.log(r)
      })
  }, [])

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

export default Deployments
