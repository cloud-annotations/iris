import React, { Component } from 'react'
import styles from './CrossHair.module.css'

export default class CrossHair extends Component {
  wrapperRef = React.createRef()

  centerDotRef = React.createRef()

  centerLeftRef = React.createRef()
  centerRightRef = React.createRef()
  centerTopRef = React.createRef()
  centerBottomRef = React.createRef()

  crosshairLeftRef = React.createRef()
  crosshairRightRef = React.createRef()
  crosshairTopRef = React.createRef()
  crosshairBottomRef = React.createRef()

  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  setVisibility = visibility => {
    this.centerDotRef.current.style.visibility = visibility

    this.centerLeftRef.current.style.visibility = visibility
    this.centerRightRef.current.style.visibility = visibility
    this.centerTopRef.current.style.visibility = visibility
    this.centerBottomRef.current.style.visibility = visibility

    this.crosshairLeftRef.current.style.visibility = visibility
    this.crosshairRightRef.current.style.visibility = visibility
    this.crosshairTopRef.current.style.visibility = visibility
    this.crosshairBottomRef.current.style.visibility = visibility
  }

  handleMouseEnter = () => {
    this.setVisibility('visible')
  }

  handleMouseLeave = () => {
    this.setVisibility('hidden')
  }

  handleMouseMove = e => {
    if (!this.wrapperRef.current) {
      return
    }

    if (this.wrapperRef.current.contains(e.target)) {
      this.setVisibility('visible')
    }

    const rect = this.wrapperRef.current.getBoundingClientRect()
    const mX = e.clientX - rect.left
    const mY = e.clientY - rect.top

    this.centerDotRef.current.style.top = `${mY}px`
    this.centerDotRef.current.style.left = `${mX}px`

    this.centerLeftRef.current.style.top = `${mY}px`
    this.centerLeftRef.current.style.left = `${mX - 8}px`
    this.centerRightRef.current.style.top = `${mY}px`
    this.centerRightRef.current.style.left = `${mX + 4}px`

    this.centerTopRef.current.style.left = `${mX}px`
    this.centerTopRef.current.style.top = `${mY - 8}px`
    this.centerBottomRef.current.style.left = `${mX}px`
    this.centerBottomRef.current.style.top = `${mY + 4}px`

    this.crosshairLeftRef.current.style.top = `${mY}px`
    this.crosshairRightRef.current.style.top = `${mY}px`
    this.crosshairLeftRef.current.style.width = `${mX - 11}px`
    this.crosshairRightRef.current.style.left = `${mX + 12}px`

    this.crosshairTopRef.current.style.left = `${mX}px`
    this.crosshairTopRef.current.style.height = `${mY - 11}px`
    this.crosshairBottomRef.current.style.left = `${mX}px`
    this.crosshairBottomRef.current.style.top = `${mY + 12}px`
  }

  render() {
    const { active, children, color } = this.props
    if (!active) {
      return children
    }
    return (
      <div
        draggable={false}
        ref={this.wrapperRef}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
        className={styles.wrapper}
      >
        {children}

        <div
          style={{ background: `padding-box ${color}` }}
          ref={this.centerDotRef}
          className={styles.hairDot}
        />

        <div
          style={{ background: `padding-box ${color}` }}
          ref={this.centerLeftRef}
          className={styles.hairCenterH}
        />
        <div
          style={{ background: `padding-box ${color}` }}
          ref={this.centerRightRef}
          className={styles.hairCenterH}
        />
        <div
          style={{ background: `padding-box ${color}` }}
          ref={this.centerTopRef}
          className={styles.hairCenterV}
        />
        <div
          style={{ background: `padding-box ${color}` }}
          ref={this.centerBottomRef}
          className={styles.hairCenterV}
        />

        <div ref={this.crosshairLeftRef} className={styles.hairH} />
        <div ref={this.crosshairRightRef} className={styles.hairH} />
        <div ref={this.crosshairTopRef} className={styles.hairV} />
        <div ref={this.crosshairBottomRef} className={styles.hairV} />
      </div>
    )
  }
}
