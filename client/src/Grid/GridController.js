import React, { Component } from 'react'
import GridItem from './GridItem'
import './ImageGrid.css'

class GridController extends Component {
  state = {
    dragging: false,
    lastSelectedIndex: null,
    dragStartIndex: null,
    intermediateSelection: null
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('mouseup', this.handleDragEnd)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('mouseup', this.handleDragEnd)
  }

  // const grid = document.getElementsByClassName('ImageGrid')[0]
  calculateColumnCount = () =>
    parseInt(
      window
        .getComputedStyle(this.gridRef, null)
        .getPropertyValue('grid-template-columns')
        .split('px').length - 1,
      10
    )

  handleDragStart = index => {
    this.setState({
      dragging: true,
      dragStartIndex: index
    })
  }

  handleItemEntered = index => {
    const { collection, sections, onSelectionChanged } = this.props
    const { dragging, dragStartIndex } = this.state

    if (!dragging) {
      return
    }

    let sectionMin = 0
    let sectionMax = 0
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const sectionSize = collection[section].length
      const tmpSize = sectionMin + sectionSize
      if (tmpSize > dragStartIndex) {
        sectionMax = tmpSize
        break
      }
      sectionMin = tmpSize
    }

    const columnCount = this.calculateColumnCount()
    const normalizedStartIndex = dragStartIndex - sectionMin
    const normalizedEndIndex = index - sectionMin

    const x1 = normalizedStartIndex % columnCount
    const y1 = Math.floor(normalizedStartIndex / columnCount)
    const x2 = normalizedEndIndex % columnCount
    const y2 = Math.floor(normalizedEndIndex / columnCount)

    console.log(`(${x1}, ${y1}) -> (${x2}, ${y2})`)

    const selectionCheck = this.selectionFullOf(false)
    const selection =
      this.props.selection &&
      selectionCheck.length === this.props.selection.length
        ? [...this.props.selection]
        : selectionCheck

    const intermediateSelection = selection.map((selectState, index) => {
      // If item is outside of the selection, return the same state.
      if (sectionMin > index || index >= sectionMax) {
        return selectState
      }

      const normalizedIndex = index - sectionMin
      const x = normalizedIndex % columnCount
      const y = Math.floor(normalizedIndex / columnCount)

      const yInRange = Math.min(y2, y1) <= y && y <= Math.max(y2, y1)
      const xInRange = Math.min(x2, x1) <= x && x <= Math.max(x2, x1)
      if (xInRange && yInRange) {
        return !selection[dragStartIndex]
      }

      return selectState
    })

    this.setState({
      intermediateSelection: intermediateSelection
    })
  }

  handleDragEnd = () => {
    const { onSelectionChanged } = this.props
    const { dragging } = this.state

    if (!dragging) {
      return
    }

    const selectionCheck = this.selectionFullOf(false)
    const selection =
      this.props.selection &&
      selectionCheck.length === this.props.selection.length
        ? [...this.props.selection]
        : selectionCheck

    console.log(this.state.intermediateSelection)

    const newSelection = this.state.intermediateSelection || selection

    this.setState(
      prevState => {
        let lastSelectedIndex = prevState.lastSelectedIndex

        // If we dragged a selection, we don't want a last selected for shift click.
        if (prevState.intermediateSelection !== null) {
          lastSelectedIndex = null
        }

        return {
          dragging: false,
          dragStartIndex: null,
          dragEndIndex: null,
          lastSelectedIndex: lastSelectedIndex,
          intermediateSelection: null
        }
      },
      () => {
        onSelectionChanged(newSelection)
      }
    )
  }

  handleKeyDown = event => {
    const charCode = String.fromCharCode(event.which).toLowerCase()
    // For MAC we can use metaKey to detect cmd key
    if ((event.ctrlKey || event.metaKey) && charCode === 'a') {
      event.preventDefault()
      this.selectAll()
    }
  }

  selectAll = () => {
    const { onSelectionChanged } = this.props
    const selection = this.selectionFullOf(true)
    onSelectionChanged(selection)
  }

  selectionFullOf = type => {
    const { collection } = this.props
    return Object.keys(collection).reduce((acc, key) => {
      return [...acc, ...collection[key].map(() => type)]
    }, [])
  }

  handleItemSelected = (e, index) => {
    const safeIndex = (array, index) => {
      return array.length > index && array[index]
    }

    const shiftPressed = e.shiftKey

    const selectionCheck = this.selectionFullOf(false)

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
          lastSelectedIndex: lastSelectedIndex
        }
      },
      () => {
        this.props.onSelectionChanged(selection)
      }
    )
  }

  render() {
    const { sections, collection, selection, gridItem } = this.props

    const mergedSelection = this.state.intermediateSelection || selection

    // There's got to be a better way to get an index for the grid items.
    return (
      <div>
        {sections.map(
          (i => section => {
            return (
              <div key={section}>
                {collection[section].length > 0 ? (
                  <div>
                    <div className="ImageGrid-Section-Title">
                      <div className="ImageGrid-Section-Span">{section}</div>
                    </div>
                    <div
                      className="ImageGrid"
                      ref={ref => {
                        this.gridRef = ref
                      }}
                    >
                      {collection[section].map(imagePointer => {
                        i++
                        return (
                          <GridItem
                            onDragStart={this.handleDragStart}
                            onItemEntered={this.handleItemEntered}
                            key={imagePointer}
                            imageUrl={imagePointer}
                            index={i}
                            selected={mergedSelection && mergedSelection[i]}
                            onItemSelected={this.handleItemSelected}
                            gridItem={gridItem}
                          />
                        )
                      })}
                    </div>
                    <div className="ImageGrid-Gap" />
                  </div>
                ) : (
                  ''
                )}
              </div>
            )
          })(-1)
        )}
      </div>
    )
  }
}

export default GridController
