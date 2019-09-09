import React, { useCallback, useEffect, useRef, useState } from 'react'
import { InlineLoading } from 'carbon-components-react'

import styles from './Home.module.css'
import windowDark from './window-dark.png'
import video from './trim.webm'
import video2 from './trim.mp4'
import { useGoogleAnalytics } from 'googleAnalyticsHook'

// ffmpeg -i output.webm -c copy -t 00:00:10.5 trim.webm
// ffmpeg -i trim.webm -vf loop=60:1:0,setpts=N/FRAME_RATE/TB -cpu-used 1 pause2.webm
// ffmpeg -i final.mov -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -f webm /dev/null && \
// ffmpeg -i final.mov -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 2 -c:a libopus output.webm
const Home = () => {
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  useGoogleAnalytics('home')

  const handleClick1 = useCallback(() => {
    window.location.href = '/auth/login'
    setLoading1(true)
  }, [])

  const handleClick2 = useCallback(() => {
    window.location.href = '/auth/login'
    setLoading2(true)
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
        <a
          className={styles.link}
          href="https://cloud-annotations.github.io/training/object-detection/cli/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
        </a>
        <a
          className={styles.link}
          href="https://github.com/cloud-annotations"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        {loading1 ? (
          <div className={styles.loading}>
            <InlineLoading description="Loading" success={false} />
          </div>
        ) : (
          <div className={styles.button} onClick={handleClick1}>
            Log in
          </div>
        )}
      </div>
      <div className={styles.leftWrapper}>
        <div className={styles.bigText}>Cloud Annotations</div>
        <div className={styles.subText}>
          A fast, easy and collaborative open source image annotation tool for
          teams and individuals.
        </div>
        <div className={styles.buttonsWrapper}>
          {loading2 ? (
            <div className={styles.loading}>
              <InlineLoading description="Loading" success={false} />
            </div>
          ) : (
            <div className={styles.button} onClick={handleClick2}>
              Continue with IBM Cloud
            </div>
          )}
          <a
            className={styles.buttonSecondary}
            href="https://cloud-annotations.github.io/training/object-detection/cli/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </div>
      <div className={styles.videoWrapper}>
        <img className={styles.image} src={windowDark} alt="" />
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          loop
          muted
          preload="auto"
        >
          <source src={video} type="video/webm" />
          <source src={video2} type="video/mp4" />
        </video>
      </div>
    </div>
  )
}

export default Home
