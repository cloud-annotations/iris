import React, { useEffect, useState, useCallback, useRef } from 'react'

import styles from './ThumbnailThing.module.css'
import fetchImage from 'api/fetchImage'

const MAX_HEIGHT = 80
// const MAX_WIDTH = 200

const calculateCrop = (x1, x2, y1, y2, imageSize) => {
  // If the boxes are still being dragged, the values might not be in the right order.
  const relativeXOffset = Math.min(x1, x2)
  const relativeYOffset = Math.min(y1, y2)
  const relativeBoxWidth = Math.abs(x2 - x1)
  const relativeBoxHeight = Math.abs(y2 - y1)

  const pixelBoxWidth = relativeBoxWidth * imageSize[0]
  const pixelBoxHeight = relativeBoxHeight * imageSize[1]
  const pixelXOffset = relativeXOffset * imageSize[0]
  const pixelYOffset = relativeYOffset * imageSize[1]

  // To prevent division by zero.
  const safeBoxWidth = Math.max(pixelBoxWidth, 1)
  const safeBoxHeight = Math.max(pixelBoxHeight, 1)

  let scale
  let actualWidth
  let actualHeight

  // if (safeBoxWidth > safeBoxHeight) {
  //   scale = MAX_WIDTH / safeBoxWidth
  //   actualWidth = MAX_WIDTH
  //   actualHeight = safeBoxHeight * scale
  // } else {
  scale = MAX_HEIGHT / safeBoxHeight
  actualWidth = safeBoxWidth * scale
  actualHeight = MAX_HEIGHT
  // }

  const xOffset = -scale * pixelXOffset
  const yOffset = -scale * pixelYOffset

  return {
    cropWidth: actualWidth,
    cropHeight: actualHeight,
    xOffset: xOffset,
    yOffset: yOffset,
    fullWidth: scale * imageSize[0],
    fullHeight: scale * imageSize[1],
  }
}

const ListItem = ({ box, image, imageDims }) => {
  const {
    cropWidth,
    cropHeight,
    xOffset,
    yOffset,
    fullWidth,
    fullHeight,
  } = calculateCrop(box.x, box.x2, box.y, box.y2, imageDims)

  return (
    <div className={styles.thumbnailWrapper}>
      <div
        style={{
          backgroundImage: `url(${image})`,
          width: `${cropWidth}px`,
          height: `${cropHeight}px`,
          backgroundPosition: `${xOffset}px ${yOffset}px`,
          backgroundSize: `${fullWidth}px ${fullHeight}px`,
        }}
      />
    </div>
  )
}

const EMPTY_IMAGE =
  'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

// const useImage = (endpoint, bucket, image) => {
//   const [imageData, setImageData] = useState(EMPTY_IMAGE)
//   useEffect(() => {
//     let canceled = false
//     let loaded = false

//     const loadImage = async (imageToLoad) => {
//       const imageData = await fetchImage(endpoint, bucket, imageToLoad, false)
//       if (!canceled && image === imageToLoad) {
//         loaded = true
//         setImageData(imageData.image)
//       }
//     }

//     // If the image hasn't loaded after 20ms it probably isn't cached, so set it
//     // to an empty image. This prevents flickering if the image is cached, but
//     // wipes the image fast enough if it's not cached.
//     setTimeout(() => {
//       if (!canceled && !loaded) {
//         setImageData(EMPTY_IMAGE)
//       }
//     }, 20)

//     if (image) {
//       loadImage(image)
//     }

//     return () => {
//       canceled = true
//     }
//   }, [endpoint, bucket, image])

//   return imageData
// }

const LayersPanel = ({
  selected,
  secondarySelected,
  bboxes,
  image,
  endpoint,
  bucket,
}) => {
  const imageRef = useRef(null)
  const [imageDims, setImageDims] = useState([0, 0])
  const [imageData, setImage] = useState(EMPTY_IMAGE)

  // const imageData = useImage(endpoint, bucket, image)
  const handleObserver = useCallback(
    (entries, observer) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target)
          const res = await fetchImage(endpoint, bucket, image, 160)
          setImage(res.image)
          const img = new Image()
          img.onload = () => {
            setImageDims([img.width, img.height])
          }
          img.src = res.image
        }
      })
    },
    [bucket, endpoint, image]
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

  // useEffect(() => {
  //   const img = new Image()
  //   img.onload = () => {
  //     setImageDims([img.width, img.height])
  //   }
  //   img.src = imageData
  // }, [imageData])

  return (
    <div
      className={
        selected
          ? styles.selected
          : secondarySelected
          ? styles.secondarySelected
          : styles.container
      }
    >
      <div className={styles.highlight} />
      <div ref={imageRef} className={styles.image}>
        {bboxes.map((box) => (
          <ListItem
            box={box}
            image={imageData}
            imageDims={imageDims}
            selected={selected || secondarySelected}
          />
        ))}
      </div>
      <div className={styles.iconWrapper}>
        <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
        </svg>
      </div>
    </div>
  )
}

export default LayersPanel
