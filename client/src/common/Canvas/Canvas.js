import React, { Component } from 'react'
import Box from './Box'
import Nobs from './Nobs'
import TouchTargets from './TouchTargets'

import styles from './Canvas.module.css'

export const MOVE = 'move'
export const BOX = 'box'

export default class App extends Component {
  state = {
    size: { imageWidth: 0, imageHeight: 0 },
    dragging: false,
    move: [0, 0],
    box: 0
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize)
    document.addEventListener('mouseup', this.handleDragEnd)
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
    document.removeEventListener('mouseup', this.handleDragEnd)
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  handleCanvasDragStart = e => {
    const { mode, onDrawStarted } = this.props
    const { size } = this.state

    // Start drag if it was a left click.
    if (e.button !== 0 || mode !== BOX) {
      return
    }

    const { imageWidth, imageHeight } = size

    const rect = this.cavasRef.getBoundingClientRect()
    const mX = (e.clientX - rect.left) / imageWidth
    const mY = (e.clientY - rect.top) / imageHeight

    onDrawStarted({
      x: Math.min(1, Math.max(0, mX)),
      y: Math.min(1, Math.max(0, mY)),
      x2: Math.min(1, Math.max(0, mX)),
      y2: Math.min(1, Math.max(0, mY))
    })

    this.setState({
      dragging: true,
      move: [1, 1],
      box: 0
    })
  }

  handleMouseDown = (e, index) => {
    const { mode } = this.props

    // Start drag if it was a left click.
    if (e.button !== 0 || mode !== MOVE) {
      return
    }

    const id = e.target.id
    const move = [0, 0]
    if (id.startsWith('0')) {
      move[0] = 0
    } else {
      move[0] = 1
    }
    if (id.endsWith('0')) {
      move[1] = 0
    } else {
      move[1] = 1
    }
    this.setState({
      dragging: true,
      move: move,
      box: index
    })
  }

  handleMouseMove = e => {
    const { onCoordinatesChanged, bboxes } = this.props
    const { dragging, move, box, size } = this.state

    if (!dragging) {
      return
    }

    const { x, y, x2, y2, ...rest } = bboxes[box]
    const { imageWidth, imageHeight } = size

    const rect = this.cavasRef.getBoundingClientRect()
    const mX = (e.clientX - rect.left) / imageWidth
    const mY = (e.clientY - rect.top) / imageHeight

    let newX
    let newY
    let newX2
    let newY2

    if (move[0] === 0) {
      newX = mX
      newX2 = x2
    } else {
      newX = x
      newX2 = mX
    }

    if (move[1] === 0) {
      newY = mY
      newY2 = y2
    } else {
      newY = y
      newY2 = mY
    }

    onCoordinatesChanged(
      {
        x: Math.min(1, Math.max(0, newX)),
        y: Math.min(1, Math.max(0, newY)),
        x2: Math.min(1, Math.max(0, newX2)),
        y2: Math.min(1, Math.max(0, newY2)),
        ...rest
      },
      box
    )
  }

  handleDragEnd = e => {
    const { onCoordinatesChanged, bboxes } = this.props
    const { dragging, box } = this.state

    if (!dragging) {
      return
    }

    const { x, y, x2, y2, ...rest } = bboxes[box]

    onCoordinatesChanged(
      {
        x: Math.min(x, x2),
        y: Math.min(y, y2),
        x2: Math.max(x, x2),
        y2: Math.max(y, y2),
        ...rest
      },
      box
    )
    this.setState({ dragging: false })
  }

  handleWindowResize = e => {
    this.setState({
      size: {
        imageWidth: this.cavasRef.width,
        imageHeight: this.cavasRef.height
      }
    })
  }

  handleOnImageLoad = e => {
    this.setState({
      size: { imageWidth: e.target.width, imageHeight: e.target.height }
    })
  }

  render() {
    return (
      <div onMouseDown={this.handleCanvasDragStart} className={styles.wrapper}>
        <img
          className={styles.image}
          alt="cats"
          draggable={false}
          src={this.props.image}
          onLoad={this.handleOnImageLoad}
          ref={ref => {
            this.cavasRef = ref
          }}
          onDragStart={e => {
            e.preventDefault()
          }}
        />
        <div className={styles.blendMode}>
          {this.props.bboxes.map((bbox, i) => (
            <div>
              <Box key={i} index={i} bbox={bbox} imageSize={this.state.size} />
              {this.props.mode === MOVE && (
                <Nobs
                  key={i}
                  index={i}
                  bbox={bbox}
                  imageSize={this.state.size}
                />
              )}
            </div>
          ))}
        </div>
        {this.props.mode === BOX &&
          this.props.bboxes.map((bbox, i) => (
            <Box
              key={i}
              index={i}
              bbox={bbox}
              mode={BOX}
              imageSize={this.state.size}
            />
          ))}
        {this.props.mode === MOVE &&
          this.props.bboxes.map((bbox, i) => (
            <TouchTargets
              key={i}
              index={i}
              bbox={bbox}
              onCornerGrabbed={this.handleMouseDown}
              imageSize={this.state.size}
            />
          ))}
      </div>
    )
  }
}
