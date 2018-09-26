import React, { Component } from 'react'
import './SelectionBar.css'

class SelectionBar extends Component {
  state = {
    showDropDown: false
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = e => {
    if (this.dropDownRef && !this.dropDownRef.contains(e.target)) {
      this.setState({
        showDropDown: false
      })
    }
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
      deselectAll,
      ...other
    } = this.props
    return (
      <div className={`SelectionBar ${selectionCount > 0 ? '--Active' : ''}`}>
        <div className="SelectionBar-count">{`${selectionCount} selected`}</div>
        <div
          className={`SelectionBar-DropDown ${
            this.state.showDropDown ? '--Active' : ''
          }`}
          ref={input => {
            this.dropDownRef = input
          }}
          onClick={this.showDropDown}
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
            ref={input => {
              this.filterFieldRef = input
            }}
          />
          <div className="SelectionBar-DropDown-Menu">
            {sections.map(section => {
              return (
                <div className="SelectionBar-DropDown-MenuItemWrapper">
                  <div className="SelectionBar-DropDown-MenuItem">
                    {section}
                  </div>
                </div>
              )
            })}
            <div className="SelectionBar-DropDown-MenuItemWrapper">
              <div className="SelectionBar-DropDown-MenuItem">Unlabel</div>
            </div>
          </div>
        </div>
        <div onClick={deleteImages}>Delete</div>
        <div className="SelectionBar-close-IconWrapper" onClick={deselectAll}>
          <svg
            className="SelectionBar-close-Icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <path d="M10 9.293l4.146-4.147.708.708L10.707 10l4.147 4.146-.708.708L10 10.707l-4.146 4.147-.708-.708L9.293 10 5.146 5.854l.708-.708L10 9.293z" />
          </svg>
        </div>
      </div>
    )
  }
}

export default SelectionBar
