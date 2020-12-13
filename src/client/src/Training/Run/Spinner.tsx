import React from 'react'

// @ts-ignore
import { Loading } from 'carbon-components-react'

import styles from './spinner.module.css'

interface Props {
  loading: boolean
  label: string
}

function Spinner({ loading, label }: Props) {
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Loading className="small-loader" active={true} withOverlay={false} />
        <div>{label}</div>
      </div>
    )
  }
  return null
}

export default Spinner
