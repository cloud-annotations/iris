import React, { useCallback } from 'react'

import styles from './Home.module.css'

const Home = () => {
  const handleClick = useCallback(() => {
    window.location.href = '/auth/login'
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.button} onClick={handleClick}>
        Continue with IBM Cloud
      </div>
    </div>
  )
}

export default Home
