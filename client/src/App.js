import React, { Component } from 'react'
import './App.css'

const token = `eyJraWQiOiIyMDE3MTAzMC0wMDowMDowMCIsImFsZyI6IlJTMjU2In0.eyJpYW1faWQiOiJpYW0tU2VydmljZUlkLWNjMGMyODczLTVhYmMtNDNmMC04YmQ5LWI3MDM0YWY5Y2ZmNyIsImlkIjoiaWFtLVNlcnZpY2VJZC1jYzBjMjg3My01YWJjLTQzZjAtOGJkOS1iNzAzNGFmOWNmZjciLCJyZWFsbWlkIjoiaWFtIiwiaWRlbnRpZmllciI6IlNlcnZpY2VJZC1jYzBjMjg3My01YWJjLTQzZjAtOGJkOS1iNzAzNGFmOWNmZjciLCJzdWIiOiJTZXJ2aWNlSWQtY2MwYzI4NzMtNWFiYy00M2YwLThiZDktYjcwMzRhZjljZmY3Iiwic3ViX3R5cGUiOiJTZXJ2aWNlSWQiLCJhY2NvdW50Ijp7ImJzcyI6IjE5NTUyZjY3OWExZjFmZWJhNDEyOTI3ZTA0YjMyNTUzIn0sImlhdCI6MTUzNjk3Njk0MCwiZXhwIjoxNTM2OTgwNTQwLCJpc3MiOiJodHRwczovL2lhbS5uZy5ibHVlbWl4Lm5ldC9vaWRjL3Rva2VuIiwiZ3JhbnRfdHlwZSI6InVybjppYm06cGFyYW1zOm9hdXRoOmdyYW50LXR5cGU6YXBpa2V5Iiwic2NvcGUiOiJpYm0gb3BlbmlkIiwiY2xpZW50X2lkIjoiZGVmYXVsdCIsImFjciI6MSwiYW1yIjpbInB3ZCJdfQ.dRXRBElHMEskbcil2R25NpPC5jIzoDF2Z9uBHsw3oYHTS0pJroKbapfjCBoJork4XUU11Kbev1If1DWcxTE-FzyEIbAWH-WVS_O5ltgR0lgu3ZI4RGZWtkuNX0PGSqmCIGBJzamJVRhWo8OphwGleTYCIv6VhSfWUC1zK5KTnTceCCoqXR_f6eRtcnAcfxzZHkbhRdKIv3MHD08fKKgcmdSJf3JG08K8IY6C-mHX70HDUveLyvKNohBbkXzTQc-0Gy6yj0vNBw4QjUl75-VknTDvk4-dbZox0EGd9FAuQf0MEAU9iERwZ-0U0cd9TKQbQw0YPFAH3sMqn0CxHyrZHQ`

class App extends Component {
  constructor(props) {
    super(props)

    this.generateToken()

    this.calculateCollectionSize()

    // const sections = ['Unlabeled', 'Cats', 'Dogs', 'Elephants', 'Clock Towers']
    // const collection = this.generateCollection()
    //
    // const allImageCount = collection
    //   .reduce((accumulator, section) => {
    //     return accumulator + section.images.length
    //   }, 0)
    //   .toLocaleString()
    // const labeledImageCount = collection
    //   .reduce((accumulator, section) => {
    //     if (section.label !== 'Unlabeled') {
    //       return accumulator + section.images.length
    //     }
    //     return accumulator
    //   }, 0)
    //   .toLocaleString()
    // const unlabeledImageCount = collection
    //   .reduce((accumulator, section) => {
    //     if (section.label === 'Unlabeled') {
    //       return accumulator + section.images.length
    //     }
    //     return accumulator
    //   }, 0)
    //   .toLocaleString()

    this.state = {
      sections: ['Unlabeled'],
      collection: [{ label: 'Unlabeled', images: [] }],
      allImageCount: 10,
      labeledImageCount: 10,
      unlabeledImageCount: 10,
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

  arrayBufferToBase64 = buffer => {
    var binary = ''
    var bytes = [].slice.call(new Uint8Array(buffer))
    bytes.forEach(b => (binary += String.fromCharCode(b)))
    return window.btoa(binary)
  }

  generateToken = () => {
    const url = `https://iam.bluemix.net/oidc/token?apikey=sXN1216NkUnHjTlaQ8Vomkx4eeiF0f4xlq1s7WQnCAJr&response_type=cloud_iam&grant_type=urn:ibm:params:oauth:grant-type:apikey`
    const request = new Request(url)
    fetch(request, { method: 'POST', mode: 'cors' })
      .then(response => response.text())
      .then(data => {
        console.log(data)
      })
      .catch(error => {
        console.error(error)
      })
  }

  calculateCollectionSize = () => {
    const url = 'api/list'
    const options = {
      method: 'GET'
    }
    const request = new Request(url)
    fetch(request, options)
      .then(response => response.json())
      .then(str => new window.DOMParser().parseFromString(str.xml, 'text/xml'))
      .then(data => {
        const elements = data.getElementsByTagName('Contents')
        const imageList = Array.prototype.map.call(elements, element => {
          return element.getElementsByTagName('Key')[0].innerHTML
        })
        console.log(imageList)

        this.setState(
          {
            imageList: imageList
          },
          this.generateCollection
        )
      })
      .catch(error => {
        console.error(error)
      })
  }

  generateCollection = () => {
    this.state.imageList.map((imageUrl, i) => {
      const url = `api/image/${imageUrl}`
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      fetch(request, options)
        .then(response => {
          response.arrayBuffer().then(buffer => {
            const base64Flag = 'data:image/jpeg;base64,'
            const imageStr = this.arrayBufferToBase64(buffer)

            const newCollection = this.state.collection.map(item => {
              if (item.label === 'Unlabeled') {
                const newImages = item.images
                newImages[i] = base64Flag + imageStr // This will cause an issue, we can't assume the array will be full
                item.images = newImages
                return item
              }
              return item
            })

            this.setState({
              collection: newCollection
            })
          })
        })
        .catch(error => {
          console.error(error)
        })
    })

    const collection = this.state.sections.map(title => {
      const imageCount = this.state.imageList.length
      return {
        label: title,
        images: Array(imageCount).fill(
          'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        )
      }
    })

    this.setState({
      collection: collection
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
            <input type="file" />
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
