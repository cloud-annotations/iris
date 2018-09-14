import React, { Component } from 'react'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    const sections = [
      'Unlabeled',
      'Cats',
      'Dogs',
      'Elephants',
      'Clock Towers'
      // 'VGA',
      // 'USB',
      // 'Thunderbolt',
      // 'Micro USB',
      // 'Mag Safe Power Cord',
      // 'Planes',
      // 'Trains',
      // 'Automobiles',
      // 'Infinity',
      // 'And',
      // 'Beyond'
    ]
    const collection = this.generateCollection(sections)

    const allImageCount = collection
      .reduce((accumulator, section) => {
        return accumulator + section.images.length
      }, 0)
      .toLocaleString()
    const labeledImageCount = collection
      .reduce((accumulator, section) => {
        if (section.label !== 'Unlabeled') {
          return accumulator + section.images.length
        }
        return accumulator
      }, 0)
      .toLocaleString()
    const unlabeledImageCount = collection
      .reduce((accumulator, section) => {
        if (section.label === 'Unlabeled') {
          return accumulator + section.images.length
        }
        return accumulator
      }, 0)
      .toLocaleString()

    this.state = {
      sections: sections,
      collection: collection,
      allImageCount: allImageCount,
      labeledImageCount: labeledImageCount,
      unlabeledImageCount: unlabeledImageCount,
      addingLabels: false
    }
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

  generateCollection = (sections) => {
    return sections.map(title => {
      const min = 50
      const max = 500
      const imageCount = Math.floor(Math.random() * (max - min)) + min
      return {
        label: title,
        images: Array(imageCount)
          .fill('')
          .map(() => {
            // return 'https://picsum.photos/224/?random&t=' + Math.random()
            if (title === 'Unlabeled') {
              return `https://source.unsplash.com/224x224/?sig=${Math.floor(
                Math.random() * 2000
              )}`
            }
            return `https://source.unsplash.com/224x224/?${title}&sig=${Math.floor(
              Math.random() * 2000
            )}`
            // return 'https://loremflickr.com/240/240/dog?random=' + Math.random()
          })
      }
    })
  }

  createLabel = () => {
    const newSections = [...this.state.sections, 'Cars']
    const collection = this.generateCollection(newSections)
    this.setState({
      sections: newSections,
      collection: collection,
      addingLabels: false
    })
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.createLabel()
    }
  }

  render() {
    return (
      <div>
        <div className="App-TopBar">
          <div className="App-TopBar-Title">Visual Recognition Tool</div>
          <div className="App-TopBar-BreadCrumb">
            &nbsp;/&nbsp;
            <a href="#TODO" className="App-TopBar-ServiceID">
              Visual Recognition-r0
            </a>
          </div>
        </div>
        <div className="App-MidBar">
          <div className="App-MidBar-Button App-MidBar-Projects">
            <svg
              className="icon-arrow"
              width="16"
              height="14"
              viewBox="0 0 16 14"
            >
              <path d="M4.044 8.003l4.09 3.905-1.374 1.453-6.763-6.356L6.759.639 8.135 2.09 4.043 6.003h11.954v2H4.044z" />
            </svg>Projects
          </div>
          <div className="App-MidBar-ProjectID">Brazil Cables Project</div>
          <div className="App-MidBar-Button App-MidBar-AddImages">
            <svg className="icon" width="16" height="16" viewBox="0 0 16 16">
              <path d="M7 7H4v2h3v3h2V9h3V7H9V4H7v3zm1 9A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
            </svg>Add Images
          </div>
        </div>
        <div className="App-LowBar" />
        <div className="App-Sidebar">
          <div className="App-Sidebar-Fixed-Items">
            <div className="App-Sidebar-Item--Active">
              <div className="App-Sidebar-Item-Title">All images</div>
              <div className="App-Sidebar-Item-Count">
                {this.state.allImageCount}
              </div>
            </div>
            <div className="App-Sidebar-Item">
              <div className="App-Sidebar-Item-Title">Labeled</div>
              <div className="App-Sidebar-Item-Count">
                {this.state.labeledImageCount}
              </div>
            </div>
            <div className="App-Sidebar-Item">
              <div className="App-Sidebar-Item-Title">Unlabeled</div>
              <div className="App-Sidebar-Item-Count">
                {this.state.unlabeledImageCount}
              </div>
            </div>

            {this.state.addingLabels ? (
              <div
                className="App-Sidebar-Field-Wrapper"
                ref={input => {
                  this.labelFieldRef = input
                }}
              >
                <input
                  className="App-Sidebar-Add-Label-Field"
                  type="text"
                  placeholder="Label name"
                  ref={input => {
                    this.labelNameInput = input
                  }}
                  onKeyPress={this.handleKeyPress}
                />
                <div
                  className="App-Sidebar-Add-Label-Field-Icon"
                  onClick={this.createLabel}
                >
                  <svg
                    className="icon-thin-add"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.57142857 4H7.42857143v3.42857143H4v1.14285714h3.42857143V12h1.14285714V8.57142857H12V7.42857143H8.57142857z" />
                    <path d="M8 14.8571429c-3.78114286 0-6.85714286-3.076-6.85714286-6.8571429 0-3.78114286 3.076-6.85714286 6.85714286-6.85714286 3.7811429 0 6.8571429 3.076 6.8571429 6.85714286 0 3.7811429-3.076 6.8571429-6.8571429 6.8571429M8 0C3.58228571 0 0 3.58228571 0 8c0 4.4177143 3.58228571 8 8 8 4.4177143 0 8-3.5822857 8-8 0-4.41771429-3.5822857-8-8-8" />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                className="App-Sidebar-Add-Label-Button"
                onClick={() => {
                  this.setState({ addingLabels: true }, () => {
                    this.labelNameInput.focus()
                  })
                }}
              >
                Add Label
              </div>
            )}
          </div>

          {this.state.collection
            .filter(section => {
              return section.label !== 'Unlabeled'
            })
            .map(section => {
              return (
                <div className="App-Sidebar-Item">
                  <div className="App-Sidebar-Item-Title">{section.label}</div>
                  <div className="App-Sidebar-Item-Count">
                    {section.images.length.toLocaleString()}
                  </div>
                </div>
              )
            })}
        </div>
        <div className="App-Parent">
          {this.state.collection.map(section => {
            return (
              <div>
                <div className="App-Section-Title">
                  <div className="App-Section-Span">{section.label}</div>
                </div>
                <div className="App-ImageGrid">
                  {section.images.map(image => {
                    return <img src={image} />
                  })}
                </div>
              </div>
            )
          })}

          <div className="App-ImageGrid-Gap" />
        </div>
      </div>
    )
  }
}

export default App
