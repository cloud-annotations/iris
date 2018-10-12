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
    const {
      selectionCount,
      sections,
      labelImages,
      deleteImages,
      deselectAll,
      createLabel
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
              placeholder="Label"
              onChange={this.filterChange}
              ref={input => {
                this.filterFieldRef = input
              }}
              onKeyPress={this.handleKeyPress}
            />
            <div
              className={`SelectionBar-DropDown-Menu ${
                this.state.filter.trim() !== '' ? '--Filtering' : ''
              }`}
            >
              {this.state.filter.trim() !== '' &&
              this.filterList(this.state.filter, onlyLabels).length === 0 ? (
                <div
                  className="SelectionBar-DropDown-MenuItemWrapper-Button"
                  onClick={() => {
                    createLabel(this.state.filter)
                    labelImages(this.state.filter)
                  }}
                >
                  <div className="SelectionBar-DropDown-MenuItem">{`Create label "${
                    this.state.filter
                  }"`}</div>
                </div>
              ) : (
                ''
              )}
              {this.filterList(this.state.filter, onlyLabels).map(section => {
                return (
                  <div
                    className="SelectionBar-DropDown-MenuItemWrapper"
                    onClick={() => {
                      labelImages(section)
                    }}
                  >
                    <div className="SelectionBar-DropDown-MenuItem">
                      <span className="SelectionBar-DropDown-MenuItem-highlight">
                        {section.substring(0, this.state.filter.length)}
                      </span>
                      {section.substring(this.state.filter.length)}
                    </div>
                  </div>
                )
              })}
              {this.state.filter.trim() === '' ? (
                <div
                  className="SelectionBar-DropDown-MenuItemWrapper"
                  onClick={() => {
                    labelImages('Unlabeled')
                  }}
                >
                  <div className="SelectionBar-DropDown-MenuItem">Unlabel</div>
                </div>
              ) : (
                ''
              )}
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
