import React, { Component } from 'react'
import './TitleBar.css'

class TitleBar extends Component {
  render() {
    return (
      <div className="TitleBar">
        <div className="TitleBar-title">Annotate ML</div>
        <div className="TitleBar-breadCrumb">
          &nbsp;//&nbsp;
          <a href="#TODO" className="TitleBar-serviceID">
            TODO: figure out what to put here.
          </a>
        </div>
      </div>
    )
  }
}

export default TitleBar
