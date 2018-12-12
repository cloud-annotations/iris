import React, { Component } from 'react'
import './ImageGrid.css'
import './GridIcon.css'

class GridItemContainer extends Component {
  onClick = e => {
    const { onItemSelected, index } = this.props
    onItemSelected(e, index)
  }

  onMouseDown = e => {
    const { dragStart, index } = this.props
    if (e.button === 0) {
      dragStart(index)
    }
  }

  onMouseOver = e => {
    const { drag, index } = this.props
    drag(index)
  }

  render() {
    const { selected, gridItem, imageUrl } = this.props
    return (
      <div
        onMouseDown={this.onMouseDown}
        onMouseOver={this.onMouseOver}
        onClick={this.onClick}
        className={`GridIcon-Wrapper ${selected ? '--Active' : ''}`}
      >
        {React.cloneElement(gridItem, { imageUrl: imageUrl })}
        <div className="GridIcon-check-IconWrapper">
          <svg
            className="GridIcon-check-Icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
          </svg>
        </div>
      </div>
    )
  }
}

class GridContainer extends Component {
  state = {
    dragging: false,
    lastSelected: null,
    dragStartIndex: null
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('mouseup', this.handleDragEnd)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('mouseup', this.handleDragEnd)
  }

  getColCount = () => {
    const grid = document.getElementsByClassName('ImageGrid')[0]
    return parseInt(
      window
        .getComputedStyle(grid, null)
        .getPropertyValue('grid-template-columns')
        .split('px').length - 1,
      10
    )
  }

  handleDragStart = index => {
    this.setState({
      dragging: true,
      dragStartIndex: index
    })
  }

  handleDrag = index => {
    if (this.state.dragging) {
      let sectionMin = 0
      let sectionMax = 0
      for (let i = 0; i < this.state.labelList.length; i++) {
        const label = this.state.labelList[i]
        const sectionSize = this.state.collection[label].length
        const tmpSize = sectionMin + sectionSize
        if (tmpSize > this.dragStartIndex) {
          sectionMax = tmpSize
          break
        }
        sectionMin = tmpSize
      }

      const colCount = this.getColCount()
      const normalizedStartIndex = this.dragStartIndex - sectionMin
      const normalizedEndIndex = index - sectionMin

      const x1 = normalizedStartIndex % colCount
      const y1 = Math.floor(normalizedStartIndex / colCount)
      const x2 = normalizedEndIndex % colCount
      const y2 = Math.floor(normalizedEndIndex / colCount)

      console.log(`(${x1}, ${y1}) -> (${x2}, ${y2})`)

      this.setState(prevState => {
        const newTmpSelection = prevState.selection.map(
          (selectState, index) => {
            if (sectionMin <= index && index < sectionMax) {
              const normalizedIndex = index - sectionMin
              const x = normalizedIndex % colCount
              const y = Math.floor(normalizedIndex / colCount)

              if (Math.min(y2, y1) <= y && y <= Math.max(y2, y1)) {
                if (Math.min(x2, x1) <= x && x <= Math.max(x2, x1)) {
                  return !prevState.selection[this.dragStartIndex]
                }
              }
            }
            return selectState
          }
        )

        return {
          tmpSelection: newTmpSelection
        }
      })
    }
  }

  handleDragEnd = () => {
    if (this.state.dragging) {
      this.setState(prevState => {
        const newSelection = prevState.tmpSelection || prevState.selection
        let newLastSelect = prevState.lastSelected
        if (prevState.tmpSelection !== null) {
          newLastSelect = null
        }
        return {
          selection: newSelection,
          lastSelected: newLastSelect,
          tmpSelection: null
        }
      })
    }
    this.setState({
      dragging: false,
      dragStartIndex: null,
      dragEndIndex: null
    })
  }

  handleKeyDown = event => {
    let charCode = String.fromCharCode(event.which).toLowerCase()
    // For MAC we can use metaKey to detect cmd key
    if ((event.ctrlKey || event.metaKey) && charCode === 'a') {
      event.preventDefault()
      // this.setState(prevState => {
      //   const cSection = prevState.currentSection
      //
      //   // TODO: clean this up.
      //   let startOfSection = 0
      //   let endOfSection = 0
      //   if (cSection === ALL_IMAGES) {
      //     prevState.labelList.forEach(section => {
      //       endOfSection += prevState.collection[section].length
      //     })
      //   } else if (cSection === LABELED) {
      //     prevState.labelList.forEach(section => {
      //       if (section === 'Unlabeled') {
      //         startOfSection += prevState.collection[section].length
      //       }
      //       endOfSection += prevState.collection[section].length
      //     })
      //   } else if (cSection === UNLABELED) {
      //     prevState.labelList.forEach(section => {
      //       if (section === 'Unlabeled') {
      //         endOfSection += prevState.collection[section].length
      //       }
      //     })
      //   } else {
      //     prevState.labelList.forEach(section => {
      //       if (endOfSection > 0) {
      //         return
      //       }
      //       if (section !== cSection) {
      //         startOfSection += prevState.collection[section].length
      //       } else {
      //         endOfSection =
      //           startOfSection + prevState.collection[section].length
      //       }
      //     })
      //   }
      //
      //   const newSelection = prevState.selection.map((_, index) => {
      //     if (startOfSection <= index && index < endOfSection) {
      //       return true
      //     }
      //     return false
      //   })
      //
      //   return {
      //     selection: newSelection
      //   }
      // })
      console.log('Ctrl + A pressed')
    }
  }

  gridItemSelected = (e, index) => {
    const safeIndex = (array, index) => {
      return array.length > index && array[index]
    }

    const shiftPressed = e.shiftKey

    const selectionCheck = Object.keys(this.props.collection).reduce(
      (acc, key) => {
        return [...acc, ...this.props.collection[key].map(() => false)]
      },
      []
    )

    const selection =
      this.props.selection &&
      selectionCheck.length === this.props.selection.length
        ? [...this.props.selection]
        : selectionCheck

    this.setState(
      prevState => {
        let lastSelectedIndex = prevState.lastSelected
        if (shiftPressed && lastSelectedIndex !== null) {
          // The default sort for arrays in Javascript is alphabetical.
          const sortedSelect = [lastSelectedIndex, index].sort((a, b) => a - b)

          // Set the selection type (select/deselect), as the last selected type.
          const lastSelectedType = safeIndex(selection, lastSelectedIndex)
          // Unless both the last and current selection are deselected.
          const selectionType = lastSelectedType || !safeIndex(selection, index)

          for (let i = sortedSelect[0]; i <= sortedSelect[1]; i++) {
            selection[i] = selectionType
          }
        } else {
          selection[index] = !selection[index]
          lastSelectedIndex = index
        }
        if (selection.filter(item => item).length === 0) {
          lastSelectedIndex = null
        }
        return {
          lastSelected: lastSelectedIndex
        }
      },
      () => {
        this.props.onSelectionChanged(selection)
      }
    )
  }

  render() {
    const { sections, collection, selection, gridItem } = this.props

    let i = 0
    return (
      <div>
        {sections.map(section => {
          return (
            <div key={section}>
              {collection[section].length > 0 ? (
                <div>
                  <div className="ImageGrid-Section-Title">
                    <div className="ImageGrid-Section-Span">{section}</div>
                  </div>
                  <div className="ImageGrid">
                    {collection[section].map(imagePointer => (
                      <GridItemContainer
                        dragStart={this.handleDragStart}
                        drag={this.handleDrag}
                        key={imagePointer}
                        imageUrl={imagePointer}
                        index={i}
                        selected={selection && selection[i++]}
                        onItemSelected={this.gridItemSelected}
                        gridItem={gridItem}
                      />
                    ))}
                  </div>
                  <div className="ImageGrid-Gap" />
                </div>
              ) : (
                ''
              )}
            </div>
          )
        })}
      </div>
    )
  }
}

export default GridContainer
