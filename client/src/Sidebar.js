import React, { Component } from 'react'
import './Sidebar.css'

class Sidebar extends Component {
  state = {
    addingLabels: false
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = e => {
    if (this.labelFieldRef && !this.labelFieldRef.contains(e.target)) {
      this.setState({
        addingLabels: false
      })
    }
  }

  createLabel = () => {
    const labelName = this.labelNameInput.value
    if (labelName === '') {
      return
    }

    this.props.createLabel(labelName)

    this.labelNameInput.value = ''
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.createLabel()
    }
  }

  render() {
    const { collection, ...other } = this.props
    return (
      <div className="Sidebar">
        <div className="Sidebar-Fixed-Items">
          <div className="Sidebar-Item --Active">
            <div className="Sidebar-itemTitle">All images</div>
            <div className="Sidebar-itemCount">
              {collection
                .reduce((accumulator, section) => {
                  return accumulator + section.images.length
                }, 0)
                .toLocaleString()}
            </div>
          </div>
          <div className="Sidebar-Item">
            <div className="Sidebar-itemTitle">Labeled</div>
            <div className="Sidebar-itemCount">
              {collection
                .reduce((accumulator, section) => {
                  if (section.label !== 'Unlabeled') {
                    return accumulator + section.images.length
                  }
                  return accumulator
                }, 0)
                .toLocaleString()}
            </div>
          </div>
          <div className="Sidebar-Item">
            <div className="Sidebar-itemTitle">Unlabeled</div>
            <div className="Sidebar-itemCount">
              {collection
                .reduce((accumulator, section) => {
                  if (section.label === 'Unlabeled') {
                    return accumulator + section.images.length
                  }
                  return accumulator
                }, 0)
                .toLocaleString()}
            </div>
          </div>

          {this.state.addingLabels ? (
            <div
              className="Sidebar-addLabel-FieldWrapper"
              ref={input => {
                this.labelFieldRef = input
              }}
            >
              <input
                className="Sidebar-addLabel-Field"
                type="text"
                placeholder="Label name"
                ref={input => {
                  this.labelNameInput = input
                }}
                onKeyPress={this.handleKeyPress}
              />
              <div
                className="Sidebar-thinAdd-IconWrapper"
                onClick={this.createLabel}
              >
                <svg
                  className="Sidebar-thinAdd-Icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.57142857 4H7.42857143v3.42857143H4v1.14285714h3.42857143V12h1.14285714V8.57142857H12V7.42857143H8.57142857z" />
                  <path d="M8 14.8571429c-3.78114286 0-6.85714286-3.076-6.85714286-6.8571429 0-3.78114286 3.076-6.85714286 6.85714286-6.85714286 3.7811429 0 6.8571429 3.076 6.8571429 6.85714286 0 3.7811429-3.076 6.8571429-6.8571429 6.8571429M8 0C3.58228571 0 0 3.58228571 0 8c0 4.4177143 3.58228571 8 8 8 4.4177143 0 8-3.5822857 8-8 0-4.41771429-3.5822857-8-8-8" />
                </svg>
              </div>
            </div>
          ) : null}
          <div
            className={`Sidebar-addLabel-Button ${
              this.state.addingLabels ? 'Sidebar-addLabel-Button--Hidden' : ''
            }`}
            onClick={() => {
              this.setState({ addingLabels: true }, () => {
                this.labelNameInput.focus()
              })
            }}
          >
            Add Label
          </div>
        </div>

        {collection
          .filter(section => {
            return section.label !== 'Unlabeled'
          })
          .map(section => {
            return (
              <div className="Sidebar-Item">
                <div className="Sidebar-itemTitle">{section.label}</div>
                <div className="Sidebar-itemCount">
                  {section.images.length.toLocaleString()}
                </div>
              </div>
            )
          })}
      </div>
    )
  }
}

export default Sidebar
