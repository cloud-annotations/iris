import React, { Component } from 'react'
import './GridIcon.css'

class GridIcon extends Component {
  onClick = e => {
    this.props.onItemSelected(e, this.props.index)
  }

  render() {
    return (
      <div
        onClick={this.onClick}
        className={`GridIcon-Wrapper ${this.props.selected ? '--Active' : ''}`}
      >
        <img className="GridIcon-Image" src={this.props.image} />
        <div className="GridIcon-check-IconWrapper">
          <svg className="GridIcon-check-Icon" width="16" height="16" viewBox="0 0 16 16">
            <path
              d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z"
              fill-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    )
  }
}

export default GridIcon
