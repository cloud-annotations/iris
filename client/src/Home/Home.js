import React, { useCallback, useEffect, useRef, useState } from 'react'
import { InlineLoading } from 'carbon-components-react'

import styles from './Home.module.css'
import windowDark from './window-dark.png'
import video from './tmp.webm'
import video2 from './tmp.mp4'

// ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -f webm /dev/null && \
// ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 2 -c:a libopus output.webm
const Home = () => {
  const [loading, setLoading] = useState(false)
  const handleClick = useCallback(() => {
    window.location.href = '/auth/login'
    setLoading(true)
  }, [])

  const videoRef = useRef(null)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBar}>
        <div className={styles.title}>
          <span className={styles.titlePrefix}>IBM</span>&nbsp;&nbsp;Cloud
          Annotations
        </div>
      </div>
      <div className={styles.videoWrapper}>
        <img className={styles.image} src={windowDark} alt="" />
        <video
          ref={videoRef}
          className={styles.video}
          autoplay
          loop
          muted
          preload="auto"
        >
          <source src={video} type="video/webm" />
          <source src={video2} type="video/mp4" />
        </video>
      </div>
      {loading ? (
        <div className={styles.loading}>
          <InlineLoading description="Loading" success={false} />
        </div>
      ) : (
        <div className={styles.button} onClick={handleClick}>
          Continue with IBM Cloud
        </div>
      )}
    </div>
  )
}

export default Home
