import React, { Component } from 'react'
import './SelectionBar.css'

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
    return list.filter(item => {
      return item.includes(trimmed)
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

  render() {
    const {
      selectionCount,
      sections,
      labelImages,
      deleteImages,
      deselectAll
    } = this.props

    const onlyLabels = sections.filter(label => {
      return label !== 'Unlabeled'
    })
    return (
      <div className={`SelectionBar ${selectionCount > 0 ? '--Active' : ''}`}>
        <div className="SelectionBar-Wrapper SelectionBar-count-Wrapper">
          <div className="SelectionBar-count">{`${selectionCount} selected`}</div>
        </div>
        <div
          className="SelectionBar-Wrapper SelectionBar-Button"
          onClick={this.showDropDown}
        >
          <div
            className={`SelectionBar-DropDown ${
              this.state.showDropDown ? '--Active' : ''
            }`}
            ref={input => {
              this.dropDownRef = input
            }}
          >
            Label{' '}
            <svg
              className="SelectionBar-dropdown-Icon"
              width="10"
              height="5"
              viewBox="0 0 10 5"
            >
              <path d="M0 0l5 4.998L10 0z" />
            </svg>
            <input
              className="SelectionBar-DropDown-Filter"
              placeholder="Filter"
              onChange={this.filterChange}
              ref={input => {
                this.filterFieldRef = input
              }}
            />
            <div className="SelectionBar-DropDown-Menu">
              {this.filterList(this.state.filter, onlyLabels).map(section => {
                return (
                  <div
                    className="SelectionBar-DropDown-MenuItemWrapper"
                    onClick={() => {
                      labelImages(section)
                    }}
                  >
                    <div className="SelectionBar-DropDown-MenuItem">
                      {section}
                    </div>
                  </div>
                )
              })}
              <div
                className="SelectionBar-DropDown-MenuItemWrapper"
                onClick={() => {
                  labelImages('Unlabeled')
                }}
              >
                <div className="SelectionBar-DropDown-MenuItem">Unlabel</div>
              </div>
            </div>
          </div>
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
