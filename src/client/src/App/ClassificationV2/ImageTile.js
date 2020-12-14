import React, { useCallback, useEffect, useRef, useState } from 'react'

import styles from './ImageTile.module.css'

import 'intersection-observer'
import fetchImage from 'api/fetchImage'

const EMPTY_IMAGE =
  'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

function ImageTile({ selected, bucket, item, endpoint }) {
  const imageRef = useRef(null)
  const [image, setImage] = useState(EMPTY_IMAGE)

  const handleObserver = useCallback(
    (entries, observer) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target)
          const res = await fetchImage(endpoint, bucket, item)
          setImage(res.image)
        }
      })
    },
    [bucket, endpoint, item]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.0,
    })
    const target = imageRef.current
    observer.observe(target)
    return () => {
      observer.unobserve(target)
    }
  }, [handleObserver])

  return (
    <div className={selected ? styles.selected : styles.container}>
      <img
        ref={imageRef}
        draggable={false}
        className={styles.image}
        alt=""
        src={image}
      />
      <div className={styles.iconWrapper}>
        <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
        </svg>
      </div>
    </div>
  )
}

export default ImageTile
