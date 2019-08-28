import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { connect } from 'react-redux'

import styles from './LayersPanel.module.css'
import { deleteBox, createLabel, createBox, syncAction } from 'redux/collection'
import { setHoveredBox } from 'redux/editor'

const MAX_HEIGHT = 24
const MAX_WIDTH = 24

const transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.225
}

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

// TODO: Make a component for DropDown and hooks.
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = e => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(e.target)) {
        return
      }
      handler(e)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

const mapStateToListItemProps = state => ({
  labels: state.collection.labels
})
const mapDispatchToProps = {
  syncAction,
  setHoveredBox
}
const ListItem = connect(
  mapStateToListItemProps,
  mapDispatchToProps
)(({ setHoveredBox, syncAction, box, labels, imageName, image, imageDims }) => {
  const [labelOpen, setLabelOpen] = useState(false)
  const [labelEditingValue, setEditingLabelValue] = useState(undefined)

  const inputRef = useRef(null)

  const handleEdit = useCallback(() => {
    setLabelOpen(true)
  }, [])

  const handleDelete = useCallback(() => {
    syncAction(deleteBox, [imageName, box])
  }, [syncAction, box, imageName])

  useEffect(() => {
    // calling this directly after setEditing doesn't work, which is why we need
    // to use and effect.
    if (labelOpen) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [labelOpen])

  const ref = useRef(null)
  const handleBlur = useCallback(() => {
    setEditingLabelValue(undefined)
    setLabelOpen(false)
  }, [])
  useOnClickOutside(ref, handleBlur)

  const handleChange = useCallback(e => {
    setEditingLabelValue(e.target.value)
  }, [])

  const handleKeyPress = useCallback(
    e => {
      if (e.key === 'Enter') {
        const newActiveLabel = inputRef.current.value.trim()
        if (newActiveLabel) {
          if (!labels.includes(newActiveLabel)) {
            syncAction(createLabel, [newActiveLabel])
          }
          syncAction(deleteBox, [imageName, box])
          syncAction(createBox, [imageName, { ...box, label: newActiveLabel }])
        }
        setEditingLabelValue(undefined)
        setLabelOpen(false)
      }
    },
    [box, imageName, labels, syncAction]
  )

  const handleLabelChosen = useCallback(
    label => e => {
      e.stopPropagation()
      syncAction(deleteBox, [imageName, box])
      syncAction(createBox, [imageName, { ...box, label: label }])
      setEditingLabelValue(undefined)
      setLabelOpen(false)
    },
    [box, imageName, syncAction]
  )

  const query = (labelEditingValue || '').trim()
  const filteredLabels =
    query === ''
      ? labels
      : labels
          // If the query is at the begining of the label.
          .filter(item => item.toLowerCase().indexOf(query.toLowerCase()) === 0)
          // Only sort the list when we filter, to make it easier to see diff.
          .sort((a, b) => a.length - b.length)

  const handleBoxEnter = useCallback(
    box => () => {
      setHoveredBox(box)
    },
    [setHoveredBox]
  )

  const handleBoxLeave = useCallback(() => {
    setHoveredBox(undefined)
  }, [setHoveredBox])

  const {
    cropWidth,
    cropHeight,
    xOffset,
    yOffset,
    fullWidth,
    fullHeight
  } = calculateCrop(box.x, box.x2, box.y, box.y2, imageDims)

  return (
    <div
      className={labelOpen ? styles.editing : styles.listItemWrapper}
      onMouseEnter={handleBoxEnter(box)}
      onMouseLeave={handleBoxLeave}
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
      <div ref={ref} className={styles.dropDownWrapper}>
        {filteredLabels.length > 0 && (
          <div className={labelOpen ? styles.cardOpen : styles.card}>
            {filteredLabels.map(label => (
              <div
                className={styles.listItem}
                key={label}
                onClick={handleLabelChosen(label)}
              >
                {label}
              </div>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          className={styles.editTextWrapper}
          readOnly={!labelOpen}
          disabled={!labelOpen}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          // We need to use undefined because and empty string is falsy
          value={
            labelEditingValue !== undefined ? labelEditingValue : box.label
          }
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
})

const LayersPanel = ({ bboxes, imageName, image, activeBox }) => {
  const [imageDims, setImageDims] = useState([0, 0])
  let mergedBoxes = [...bboxes]

  if (activeBox) {
    mergedBoxes = mergedBoxes.filter(box => box.id !== activeBox.id)
    mergedBoxes.unshift(activeBox)
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
      {mergedBoxes.map(box => (
        <motion.div
          key={box.id}
          positionTransition={transition}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition: transition }}
        >
          <ListItem
            box={box}
            image={image}
            imageName={imageName}
            imageDims={imageDims}
          />
        </motion.div>
      ))}
    </div>
  )
}

const mapStateToProps = state => ({
  activeBox: state.editor.box
})
export default connect(mapStateToProps)(LayersPanel)
