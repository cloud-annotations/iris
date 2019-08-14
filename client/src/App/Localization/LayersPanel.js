import React, { useEffect, useState, useCallback, useRef } from 'react'
import { connect } from 'react-redux'

import styles from './LayersPanel.module.css'
import { createBox, deleteBox } from 'redux/collection'

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
    cropWidth: actualWidth,
    cropHeight: actualHeight,
    xOffset: xOffset,
    yOffset: yOffset,
    fullWidth: scale * imageSize[0],
    fullHeight: scale * imageSize[1]
  }
}

const mapDispatchToProps = {
  createBox,
  deleteBox
}
const ListItem = connect(
  undefined,
  mapDispatchToProps
)(
  ({
    createBox,
    deleteBox,
    box,
    imageName,
    image,
    imageDims,
    onBoxEnter,
    onBoxLeave
  }) => {
    const [editing, setEditing] = useState(false)

    const inputRef = useRef(null)

    const handleEdit = useCallback(() => {
      setEditing(e => !e)
    }, [])

    const handleDelete = useCallback(() => {
      deleteBox(imageName, box)
    }, [box, deleteBox, imageName])

    useEffect(() => {
      // calling this directly after setEditing doesn't work, which is why we need
      // to use and effect.
      if (editing) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [editing])

    const handleBlur = useCallback(() => {
      inputRef.current.value = box.label
      setEditing(false)
    }, [box.label])

    const handleKeyPress = useCallback(
      e => {
        if (e.key === 'Enter') {
          deleteBox(imageName, box)
          createBox(imageName, { ...box, label: inputRef.current.value })
          setEditing(false)
        }
      },
      [box, createBox, deleteBox, imageName]
    )

    const handleBoxEnter = useCallback(
      box => () => {
        onBoxEnter(box)
      },
      [onBoxEnter]
    )

    const {
      cropWidth,
      cropHeight,
      xOffset,
      yOffset,
      fullWidth,
      fullHeight
    } = calculateCrop(box.x, box.x2, box.y, box.y2, imageDims)

    const labels = [
      'label1',
      'really really really really really really long label name',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label3',
      'label4'
    ]

    return (
      <div
        className={editing ? styles.editing : styles.listItemWrapper}
        onMouseEnter={handleBoxEnter(box)}
        onMouseLeave={onBoxLeave}
      >
        <div className={styles.thumbnailWrapper}>
          <div
            style={{
              backgroundImage: `url(${image})`,
              width: `${cropWidth}px`,
              height: `${cropHeight}px`,
              backgroundPosition: `${xOffset}px ${yOffset}px`,
              backgroundSize: `${fullWidth}px ${fullHeight}px`
            }}
          />
        </div>
        <div className={styles.dropDownWrapper}>
          <div className={editing ? styles.cardOpen : styles.card}>
            {labels.map(label => (
              <div className={styles.listItem} key={label}>
                {label}
              </div>
            ))}
          </div>
          <input
            ref={inputRef}
            className={styles.editTextWrapper}
            readOnly={!editing}
            disabled={!editing}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            defaultValue={box.label}
            type="text"
          />
        </div>
        <div onClick={handleEdit} className={styles.editIcon}>
          <svg height="12px" width="12px" viewBox="2 2 36 36">
            <g>
              <path d="m30 2.5l-5 5 7.5 7.5 5-5-7.5-7.5z m-27.5 27.5l0 7.5 7.5 0 20-20-7.5-7.5-20 20z m7.5 5h-5v-5h2.5v2.5h2.5v2.5z" />
            </g>
          </svg>
        </div>
        <div onClick={handleDelete} className={styles.deleteIcon}>
          <svg height="12px" width="12px" viewBox="2 2 36 36">
            <g>
              <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
            </g>
          </svg>
        </div>
      </div>
    )
  }
)

const keyForItem = (image, box) => {
  return `${image}+${JSON.stringify(box)}`
}

const LayersPanel = ({
  bboxes,
  imageName,
  image,
  onBoxEnter,
  onBoxLeave,
  intermediateBoxes
}) => {
  const [imageDims, setImageDims] = useState([0, 0])
  const sortedBboxes = [...bboxes]

  const box = intermediateBoxes[imageName]
  if (box) {
    sortedBboxes.unshift(box)
  }

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
        <ListItem
          key={keyForItem(image, box)}
          box={box}
          image={image}
          imageName={imageName}
          imageDims={imageDims}
          onBoxEnter={onBoxEnter}
          onBoxLeave={onBoxLeave}
        />
      ))}
    </div>
  )
}

const mapStateToProps = state => ({
  intermediateBoxes: state.intermediate
})
export default connect(mapStateToProps)(LayersPanel)
