import React, { Component } from 'react'
import styles from './DropDown.module.css'

export default class DropDown extends Component {
  state = {
    showDropDown: false,
    filter: ''
  }

  dropDownRef = React.createRef()
  filterFieldRef = React.createRef()

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = e => {
    if (
      this.dropDownRef.current &&
      !this.dropDownRef.current.contains(e.target)
    ) {
      this.filterFieldRef.current.value = ''
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
        this.filterFieldRef.current.focus()
      }
    )
  }

  handleKeyPress = e => {
    const { onItemChosen, labels } = this.props

    const filteredList = this.filterList(this.state.filter, labels)

    if (e.key === 'Enter') {
      if (filteredList.length === 0) {
        onItemChosen(this.state.filter)
      } else {
        onItemChosen(filteredList[0])
      }
    }
  }

  render() {
    const { filter } = this.state
    const { label, labels, onItemChosen } = this.props

    return (
      <div
        onClick={this.showDropDown}
        className={this.state.showDropDown ? styles.active : styles.default}
        ref={this.dropDownRef}
      >
        {label}
        <svg className={styles.icon} width="10" height="5" viewBox="0 0 10 5">
          <path d="M0 0l5 4.998L10 0z" />
        </svg>
        <input
          className={styles.filter}
          placeholder="Label"
          onChange={this.filterChange}
          ref={this.filterFieldRef}
          onKeyPress={this.handleKeyPress}
        />
        <div className={filter.trim() !== '' ? styles.filtering : styles.menu}>
          {filter.trim() !== '' &&
            this.filterList(filter, labels).length === 0 && (
              <div
                className={styles.menuItemButton}
                onClick={() => {
                  onItemChosen(filter)
                }}
              >
                <div
                  className={styles.menuItem}
                >{`Create label "${filter}"`}</div>
              </div>
            )}
          {this.filterList(filter, labels).map(section => {
            return (
              <div
                className={styles.menuItemWrapper}
                onClick={() => {
                  onItemChosen(section)
                }}
              >
                <div className={styles.menuItem}>
                  <span className={styles.highlight}>
                    {section.substring(0, filter.length)}
                  </span>
                  {section.substring(filter.length)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
