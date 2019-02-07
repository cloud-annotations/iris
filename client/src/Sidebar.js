import React, { Component } from 'react'
import './Sidebar.css'

export const ALL_IMAGES = 'all'
export const LABELED = 'labeled'
export const UNLABELED = 'unlabeled'

class Sidebar extends Component {
  state = {
    addingLabels: false,
    menuOpen: ''
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
    const { sectionList, onLabelAdded } = this.props
    const labelName = this.labelNameInput.value
    const trimmedCompare = sectionList.filter(label => {
      return labelName.trim() === label.name.trim()
    })
    if (labelName === '' || trimmedCompare.length > 0) {
      return
    }
    onLabelAdded(labelName)
    this.labelNameInput.value = ''
  }

  submenu = (e, label) => {
    e.stopPropagation()
    this.setState({
      menuOpen: label
    })
  }

  deleteLabel = (e, label) => {
    const { onLabelDeleted } = this.props
    e.stopPropagation()
    this.clearMenu()
    onLabelDeleted(label)
  }

  renameLabel = (e, label) => {
    e.stopPropagation()
  }

  clearMenu = () => {
    this.setState({
      menuOpen: ''
    })
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.createLabel()
    }
  }

  render() {
    const {
      sectionList,
      allImagesCount,
      labeledCount,
      unlabeledCount,
      currentSection,
      onSectionChanged
    } = this.props
    return (
      <div className="Sidebar">
        <div className="Sidebar-Fixed-Items">
          <div
            className={`Sidebar-Item ${
              currentSection === ALL_IMAGES ? '--Active' : ''
            }`}
            onClick={() => {
              onSectionChanged(ALL_IMAGES)
            }}
          >
            <div className="Sidebar-itemTitle">All images</div>
            <div className="Sidebar-itemCount">
              {allImagesCount.toLocaleString()}
            </div>
          </div>
          <div
            className={`Sidebar-Item ${
              currentSection === LABELED ? '--Active' : ''
            }`}
            onClick={() => {
              onSectionChanged(LABELED)
            }}
          >
            <div className="Sidebar-itemTitle">Labeled</div>
            <div className="Sidebar-itemCount">
              {labeledCount.toLocaleString()}
            </div>
          </div>
          <div
            className={`Sidebar-Item ${
              currentSection === UNLABELED ? '--Active' : ''
            }`}
            onClick={() => {
              onSectionChanged(UNLABELED)
            }}
          >
            <div className="Sidebar-itemTitle">Unlabeled</div>
            <div className="Sidebar-itemCount">
              {unlabeledCount.toLocaleString()}
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

        {sectionList.map(label => {
          return (
            <div
              className={`Sidebar-Item ${
                currentSection === label.name ? '--Active' : ''
              } ${this.state.menuOpen === label.name ? '--NoHover' : ''}`}
              onClick={() => {
                onSectionChanged(label.name)
              }}
            >
              <div className="Sidebar-itemTitle">{label.name}</div>
              <div className="Sidebar-itemCount">
                {label.count.toLocaleString()}
              </div>
              <div
                className="Sidebar-itemOverflow"
                onClick={e => {
                  this.submenu(e, label.name)
                }}
              >
                <svg width="3" height="15" viewBox="0 0 3 15">
                  <path d="M0 1.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 1 1-3 0M0 7.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 1 1-3 0M0 13.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 1 1-3 0" />
                </svg>
              </div>
              <div
                className={`Sidebar-itemOverflow-Menu ${
                  this.state.menuOpen === label.name ? '--Active' : ''
                }`}
                onMouseLeave={this.clearMenu}
              >
                <div
                  className="Sidebar-itemOverflow-MenuItem --Dissabled"
                  onClick={e => {
                    this.renameLabel(e, label.name)
                  }}
                >
                  Rename
                </div>
                <div
                  className="Sidebar-itemOverflow-MenuItem --Danger"
                  onClick={e => {
                    this.deleteLabel(e, label.name)
                  }}
                >
                  Delete
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}

export default Sidebar
