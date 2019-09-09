import React, { Component } from 'react'

import styles from './ThreeDotMenu.module.css'

export default class ThreeDotMenu extends Component {
  state = {
    menuOpen: false
  }

  handleDismiss = () => {
    this.setState({
      menuOpen: false
    })
  }

  handleOpen = e => {
    e.stopPropagation()
    this.setState({
      menuOpen: true
    })
  }

  render() {
    const { menuOpen } = this.state
    const { items } = this.props
    return (
      <div>
        <div className={styles.dots} onClick={this.handleOpen}>
          <svg width="3" height="15" viewBox="0 0 3 15">
            <path d="M0 1.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 1 1-3 0M0 7.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 1 1-3 0M0 13.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 1 1-3 0" />
          </svg>
        </div>

        <div
          className={menuOpen ? styles.menuCardActive : styles.menuCard}
          onMouseLeave={this.handleDismiss}
        >
          {items.map(item => {
            const style = (type => {
              switch (type) {
                case 'disabled':
                  return styles.menuItemDisabled
                case 'danger':
                  return styles.menuItemDanger
                default:
                  return styles.menuItem
              }
            })(item.type)
            return (
              <div
                className={style}
                onClick={e => {
                  e.stopPropagation()
                  this.handleDismiss()
                  item.onItemChosen(e)
                }}
              >
                {item.text}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
