import React, { Component } from 'react'
import DropDown from './DropDown'
import styles from './ToolsPanel.module.css'
import ThreeDotMenu from './ThreeDotMenu'

export default class ToolsPanel extends Component {
  render() {
    const {
      labels,
      mode,
      selectedLabel,
      bboxes,
      imageHeight,
      imageWidth,
      image,
      onModeChanged,
      onLabelChanged,
      onRelabel,
      onDelete
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
          <DropDown
            label={labels[selectedLabel]}
            labels={labels}
            onItemChosen={onLabelChanged}
          />
        </div>
        {bboxes.length === 0 || (
          <div className={styles.sectionText}>Annotations</div>
        )}
        {/* sort mutates the original array, but issues on show in Safari */}
        {[...bboxes]
          .sort((a, b) => a.label.toLowerCase() < b.label.toLowerCase())
          .map(box => {
            const [x1, x2] = [box.x, box.x2].sort((a, b) => a - b)
            const [y1, y2] = [box.y, box.y2].sort((a, b) => a - b)

            const cropHeight = 20
            const cropWidth = 30

            // To prevent division by zero.
            const boxWidth = Math.max((x2 - x1) * imageWidth, 1)
            const boxHeight = Math.max((y2 - y1) * imageHeight, 1)

            const scale = cropWidth / boxWidth
            const scaledHeight = scale * boxHeight
            const centerOffset = (cropHeight - scaledHeight) / 2
            const xOffset = -x1 * scale * imageWidth
            const yOffset = -y1 * scale * imageHeight
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
                <ThreeDotMenu
                  items={[
                    {
                      text: 'Change label',
                      type: 'disabled',
                      onItemChosen: () => {
                        onRelabel(box)
                      }
                    },
                    {
                      text: 'Delete',
                      type: 'danger',
                      onItemChosen: () => {
                        onDelete(box)
                      }
                    }
                  ]}
                />
              </div>
            )
          })}
      </div>
    )
  }
}
