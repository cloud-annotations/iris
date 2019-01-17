import React, { Component } from 'react'
import './SelectionBar.css'
import DropDown from './DropDown'

class SelectionBar extends Component {
  state = {
    showDropDown: false,
    filter: ''
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = e => {
    if (this.dropDownRef && !this.dropDownRef.contains(e.target)) {
      this.filterFieldRef.value = ''
      this.setState({
        showDropDown: false,
        filter: ''
      })
    }
  }

  filterList = (q, list) => {
    const trimmed = q.trim()
    if (trimmed === '') {
      return list
    }

    return list
      .filter(item => {
        return item.toLowerCase().indexOf(trimmed.toLowerCase()) === 0
      })
      .sort((a, b) => {
        return a.length - b.length
      })
  }

  filterChange = e => {
    this.setState({
      filter: e.target.value
    })
  }

  showDropDown = () => {
    this.setState(
      {
        showDropDown: true
      },
      () => {
        this.filterFieldRef.focus()
      }
    )
  }

  handleKeyPress = e => {
    const { labelImages, createLabel, sections } = this.props

    if (e.key === 'Enter') {
      const onlyLabels = sections.filter(label => {
        return label !== 'Unlabeled'
      })

      if (this.filterList(this.state.filter, onlyLabels).length === 0) {
        createLabel(this.state.filter)
        labelImages(this.state.filter)
        return
      }
      const label = this.filterList(this.state.filter, onlyLabels)[0]
      labelImages(label)
    }
  }

  render() {
    const { selectionCount, sections, deleteImages, deselectAll } = this.props

    const onlyLabels = sections.filter(label => {
      return label.toLowerCase() !== 'unlabeled'
    })
    return (
      <div className={`SelectionBar ${selectionCount > 0 ? '--Active' : ''}`}>
        <div className="SelectionBar-Wrapper SelectionBar-count-Wrapper">
          <div className="SelectionBar-count">{`${selectionCount} selected`}</div>
        </div>
        <div className="">
          <DropDown label="Label" labels={onlyLabels} bar />
        </div>
        <div
          className="SelectionBar-Wrapper SelectionBar-Button"
          onClick={() => {
            alert('todo')
          }}
        >
          <div>Unlabel</div>
        </div>
        <div
          className="SelectionBar-Wrapper SelectionBar-Button"
          onClick={deleteImages}
        >
          <div>Delete</div>
        </div>
        <div
          className="SelectionBar-close-IconWrapper SelectionBar-Wrapper SelectionBar-Button"
          onClick={deselectAll}
        >
          <svg className="SelectionBar-close-Icon" viewBox="5 5 10 10">
            <path d="M10 9.293l4.146-4.147.708.708L10.707 10l4.147 4.146-.708.708L10 10.707l-4.146 4.147-.708-.708L9.293 10 5.146 5.854l.708-.708L10 9.293z" />
          </svg>
        </div>
      </div>
    )
  }
}

export default SelectionBar
