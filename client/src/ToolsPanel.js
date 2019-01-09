import React, { Component } from 'react'
import DropDown from './DropDown'
import styles from './ToolsPanel.module.css'

export default class ToolsPanel extends Component {
  render() {
    const {
      labels,
      mode,
      label,
      bboxes,
      imageHeight,
      imageWidth,
      image,
      onModeChanged,
      onLabelChanged
    } = this.props
    return (
      <div className={styles.sidebar}>
        <div className={styles.sectionText}>Tools</div>
        <div className={styles.tools}>
          <div
            className={
              mode === 'move' ? styles.activeToolWrapper : styles.toolWrapper
            }
            onClick={() => {
              onModeChanged('move')
            }}
          >
            <svg
              className={styles.move}
              width="20"
              height="20"
              viewBox="0 0 40 40"
            >
              <path d="M19,11h2V29H19V11Zm-8,8H29v2H11V19ZM21,35H19l-4-6H25ZM35,19v2l-6,4V15ZM5,21V19l6-4V25ZM19,5h2l4,6H15Z" />
            </svg>
          </div>
          <div
            className={
              mode === 'box' ? styles.activeToolWrapper : styles.toolWrapper
            }
            onClick={() => {
              onModeChanged('box')
            }}
          >
            <svg
              className={styles.box}
              width="20"
              height="20"
              viewBox="0 0 40 40"
            >
              <rect x="4" y="8" width="32" height="24" />
            </svg>
          </div>
        </div>
        <div className={styles.dropDownWrapper}>
          <DropDown label={label} labels={labels} onItemChosen={() => {}} />
        </div>
        <div className={styles.sectionText}>Annotations</div>
        {bboxes
          .sort((a, b) => a.label.toLowerCase() < b.label.toLowerCase())
          .map(box => {
            const cropHeight = 20
            const cropWidth = 30

            const scale = cropWidth / ((box.x2 - box.x) * imageWidth)
            const objHeight = scale * (box.y2 - box.y) * imageHeight
            const centerOffset = (cropHeight - objHeight) / 2
            const xOffset = -box.x * scale * imageWidth
            const yOffset = -box.y * scale * imageHeight
            const backgroundSize = scale * (100 / cropWidth) * imageWidth

            return (
              <div className={styles.annotationWrapper}>
                <div
                  style={{
                    backgroundImage: `url(${image})`,
                    height: `${cropHeight}px`,
                    width: `${cropWidth}px`,
                    backgroundPosition: `${xOffset}px ${yOffset +
                      centerOffset}px`,
                    backgroundSize: `${backgroundSize}%`
                  }}
                />
                <div className={styles.labelText}>{box.label}</div>
              </div>
            )
          })}
      </div>
    )
  }
}
