import React, { useReducer, useEffect, useState, useCallback } from 'react'

import styles from './LayersPanel.module.css'

const MAX_HEIGHT = 24
const MAX_WIDTH = 24

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

  if (safeBoxWidth > safeBoxHeight) {
    scale = MAX_WIDTH / safeBoxWidth
    actualWidth = MAX_WIDTH
    actualHeight = safeBoxHeight * scale
  } else {
    scale = MAX_HEIGHT / safeBoxHeight
    actualWidth = safeBoxWidth * scale
    actualHeight = MAX_HEIGHT
  }

  const xOffset = -scale * pixelXOffset
  const yOffset = -scale * pixelYOffset

  return {
    width: actualWidth,
    height: actualHeight,
    xOffset: xOffset,
    yOffset: yOffset,
    bWidth: scale * imageSize[0],
    bHeight: scale * imageSize[1]
  }
}

const ListItem = ({ box, image, imageDims }) => {
  const [editing, setEditing] = useState(false)
  const [tmpLabelName, setTmpLabelName] = useState(undefined)

  const handleEdit = useCallback(() => {
    setEditing(e => !e)
  }, [])

  const { width, height, xOffset, yOffset, bWidth, bHeight } = calculateCrop(
    box.x,
    box.x2,
    box.y,
    box.y2,
    imageDims
  )

  return (
    <div className={editing ? styles.editing : styles.listItemWrapper}>
      <div className={styles.thumbnailWrapper}>
        <div
          style={{
            backgroundImage: `url(${image})`,
            height: `${height}px`,
            width: `${width}px`,
            backgroundPosition: `${xOffset}px ${yOffset}px`,
            backgroundSize: `${bWidth}px ${bHeight}px`
          }}
        />
      </div>
      {/* <div className={styles.labelWrapper}> */}
      {/* <div contentEditable={editing} className={styles.editTextWrapper}> */}
      <input
        className={styles.editTextWrapper}
        readOnly={!editing}
        disabled={!editing}
        value={tmpLabelName || box.label}
        type="text"
      />
      {/* {box.label} */}
      {/* </div> */}
      {/* </div> */}
      <div onClick={handleEdit} className={styles.editIcon}>
        <svg height="12px" width="12px" viewBox="2 2 36 36">
          <g>
            <path d="m30 2.5l-5 5 7.5 7.5 5-5-7.5-7.5z m-27.5 27.5l0 7.5 7.5 0 20-20-7.5-7.5-20 20z m7.5 5h-5v-5h2.5v2.5h2.5v2.5z" />
          </g>
        </svg>
      </div>
      <div className={styles.deleteIcon}>
        <svg height="12px" width="12px" viewBox="2 2 36 36">
          <g>
            <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
          </g>
        </svg>
      </div>
    </div>
  )
}

const LayersPanel = ({ bboxes, image }) => {
  const [imageDims, setImageDims] = useState([0, 0])
  // Sort mutates the original array, but issues only show in Safari.
  const sortedBboxes = [...bboxes]
  sortedBboxes.sort((a, b) => a.label.toLowerCase() < b.label.toLowerCase())

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageDims([img.width, img.height])
    }
    img.src = image
  }, [image])

  return (
    <div className={styles.wrapper}>
      {sortedBboxes.map(box => (
        <ListItem box={box} image={image} imageDims={imageDims} />
      ))}
    </div>
  )
}

export default LayersPanel
