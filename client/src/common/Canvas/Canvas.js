import React, { Component } from 'react'
import Box from './Box'
import Nobs from './Nobs'
import TouchTargets from './TouchTargets'

import styles from './Canvas.module.css'
import { generateUUID } from 'Utils'

export const MOVE = 'move'
export const BOX = 'box'

export default class App extends Component {
  state = {
    size: { imageWidth: 0, imageHeight: 0 }
  }

  box = undefined
  canvasRect = undefined
  dragging = false
  move = [0, 0]

  canvasRef = React.createRef()

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize)
    document.addEventListener('mouseup', this.handleDragEnd)
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('touchend', this.handleDragEnd)
    document.addEventListener('touchmove', this.handleMouseMove)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
    document.removeEventListener('mouseup', this.handleDragEnd)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('touchend', this.handleDragEnd)
    document.removeEventListener('touchmove', this.handleMouseMove)
  }

  handleCanvasDragStart = e => {
    const { mode, activeLabel, onBoxStarted } = this.props
    const { size } = this.state

    // Start drag if it was a left click.
    if (e.button && e.button !== 0) {
      return
    }

    if (mode !== BOX) {
      return
    }

    const { imageWidth, imageHeight } = size

    e = (() => {
      if (e.clientX && e.clientY) {
        return e
      }
      return e.touches[0]
    })()

    // bug fix for mobile safari thinking there is a scroll.
    this.canvasRect = this.canvasRef.current.getBoundingClientRect()
    const mX = (e.clientX - this.canvasRect.left) / imageWidth
    const mY = (e.clientY - this.canvasRect.top) / imageHeight

    const box = {
      id: generateUUID(),
      x: Math.min(1, Math.max(0, mX)),
      y: Math.min(1, Math.max(0, mY)),
      x2: Math.min(1, Math.max(0, mX)),
      y2: Math.min(1, Math.max(0, mY)),
      label: activeLabel
    }

    onBoxStarted(box)

    this.dragging = true
    this.move = [1, 1]
    this.editingBoxId = undefined
    this.box = box
  }

  handleMouseDown = (e, boxId, move) => {
    const { bboxes, mode } = this.props

    // Start drag if it was a left click.
    if (e.button && e.button !== 0) {
      return
    }

    if (mode !== MOVE) {
      return
    }

    // bug fix for mobile safari thinking there is a scroll.
    this.canvasRect = this.canvasRef.current.getBoundingClientRect()

    this.move = move
    this.dragging = true

    this.box = bboxes.find(b => b.id === boxId)
  }

  handleMouseMove = e => {
    const { onBoxChanged } = this.props
    const { size } = this.state

    if (!this.dragging) {
      return
    }

    const { x, y, x2, y2, ...rest } = this.box
    const { imageWidth, imageHeight } = size

    e = (() => {
      if (e.clientX && e.clientY) {
        return e
      }
      return e.touches[0]
    })()

    const mX = (e.clientX - this.canvasRect.left) / imageWidth
    const mY = (e.clientY - this.canvasRect.top) / imageHeight

    let newX
    let newY
    let newX2
    let newY2

    if (this.move[0] === 0) {
      newX = mX
      newX2 = x2
    } else {
      newX = x
      newX2 = mX
    }

    if (this.move[1] === 0) {
      newY = mY
      newY2 = y2
    } else {
      newY = y
      newY2 = mY
    }

    const computedBox = {
      x: Math.min(1, Math.max(0, newX)),
      y: Math.min(1, Math.max(0, newY)),
      x2: Math.min(1, Math.max(0, newX2)),
      y2: Math.min(1, Math.max(0, newY2)),
      ...rest
    }

    onBoxChanged(computedBox)
  }

  handleDragEnd = () => {
    const { bboxes, onBoxFinished } = this.props

    if (!this.dragging) {
      return
    }

    const { x, y, x2, y2, ...rest } = bboxes.find(b => b.id === this.box.id)

    onBoxFinished({
      x: Math.min(x, x2),
      y: Math.min(y, y2),
      x2: Math.max(x, x2),
      y2: Math.max(y, y2),
      ...rest
    })

    this.dragging = false
    this.box = undefined
  }

  handleWindowResize = () => {
    this.setState({
      size: {
        imageWidth: this.canvasRef.current.clientWidth,
        imageHeight: this.canvasRef.current.clientHeight
      }
    })
  }

  handleOnImageLoad = e => {
    this.setState({
      size: {
        imageWidth: e.target.clientWidth,
        imageHeight: e.target.clientHeight
      }
    })
  }

  render() {
    const { hovered, bboxes, mode, image, cmap } = this.props
    const { size } = this.state

    return (
      <div
        draggable={false}
        onMouseDown={this.handleCanvasDragStart}
        onTouchStart={this.handleCanvasDragStart}
        className={styles.wrapper}
      >
        <img
          className={styles.image}
          alt=""
          draggable={false}
          src={image}
          onLoad={this.handleOnImageLoad}
          ref={this.canvasRef}
          onDragStart={e => {
            e.preventDefault()
          }}
        />

        <div
          className={styles.blendMode}
          style={{
            width: size.imageWidth,
            height: size.imageHeight
          }}
        >
          {bboxes.map(bbox => (
            <div key={bbox.id}>
              <Box bbox={bbox} cmap={cmap} imageSize={size} />
              {mode === MOVE && <Nobs bbox={bbox} imageSize={size} />}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size.imageWidth,
            height: size.imageHeight
          }}
        >
          {mode === BOX &&
            bboxes.map(bbox => (
              <Box
                key={bbox.id}
                bbox={bbox}
                cmap={cmap}
                hovered={hovered && hovered.id === bbox.id}
                mode={BOX}
                imageSize={size}
              />
            ))}
          {mode === MOVE &&
            bboxes.map(bbox => (
              <TouchTargets
                key={bbox.id}
                bbox={bbox}
                onCornerGrabbed={this.handleMouseDown}
                imageSize={size}
              />
            ))}
        </div>
      </div>
    )
  }
}
