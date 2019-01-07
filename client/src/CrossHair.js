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

  handleMouseLeave = () => {
    this.centerDotRef.current.style.visibility = 'hidden'

    this.centerLeftRef.current.style.visibility = 'hidden'
    this.centerRightRef.current.style.visibility = 'hidden'
    this.centerTopRef.current.style.visibility = 'hidden'
    this.centerBottomRef.current.style.visibility = 'hidden'

    this.crosshairLeftRef.current.style.visibility = 'hidden'
    this.crosshairRightRef.current.style.visibility = 'hidden'
    this.crosshairTopRef.current.style.visibility = 'hidden'
    this.crosshairBottomRef.current.style.visibility = 'hidden'
  }

  handleMouseEnter = () => {
    this.centerDotRef.current.style.visibility = 'visible'

    this.centerLeftRef.current.style.visibility = 'visible'
    this.centerRightRef.current.style.visibility = 'visible'
    this.centerTopRef.current.style.visibility = 'visible'
    this.centerBottomRef.current.style.visibility = 'visible'

    this.crosshairLeftRef.current.style.visibility = 'visible'
    this.crosshairRightRef.current.style.visibility = 'visible'
    this.crosshairTopRef.current.style.visibility = 'visible'
    this.crosshairBottomRef.current.style.visibility = 'visible'
  }

  handleMouseMove = e => {
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
    return (
      <div
        ref={this.wrapperRef}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
        className={styles.wrapper}
      >
        {this.props.children}

        <div ref={this.centerDotRef} className={styles.hairDot} />

        <div ref={this.centerLeftRef} className={styles.hairCenterH} />
        <div ref={this.centerRightRef} className={styles.hairCenterH} />
        <div ref={this.centerTopRef} className={styles.hairCenterV} />
        <div ref={this.centerBottomRef} className={styles.hairCenterV} />

        <div ref={this.crosshairLeftRef} className={styles.hairH} />
        <div ref={this.crosshairRightRef} className={styles.hairH} />
        <div ref={this.crosshairTopRef} className={styles.hairV} />
        <div ref={this.crosshairBottomRef} className={styles.hairV} />
      </div>
    )
  }
}
