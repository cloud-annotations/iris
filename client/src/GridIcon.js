import React, { Component } from 'react'
import './GridIcon.css'

class GridIcon extends Component {
  state = {
    active: false
  }

  render() {
    return (
      <div
        onClick={() => {
          this.setState(prevState => ({
            active: !prevState.active
          }), () => {
            this.props.onItemSelected(this.state.active ? 1 : -1)
          })
        }}
        class={`ie-container ${this.state.active ? 'active' : ''}`}
      >
        <img src={this.props.image} />
        <div className="POO">
          <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16">
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
