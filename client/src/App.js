import React, { Component } from 'react'
import ImageGrid from './ImageGrid'
import Sidebar from './Sidebar'
import SelectionBar from './SelectionBar'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.calculateCollectionSize()
    this.state = {
      sections: ['Unlabeled'],
      collection: [{ label: 'Unlabeled', images: [] }],
      selection: [],
      lastSelected: null // This does not include shift clicks.
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = event => {
    let charCode = String.fromCharCode(event.which).toLowerCase()
    // For MAC we can use metaKey to detect cmd key
    if ((event.ctrlKey || event.metaKey) && charCode === 'a') {
      event.preventDefault()
      this.setState(prevState => ({
        selection: prevState.selection.map(() => true)
      }))
      console.log('Ctrl + A pressed')
    }
  }

  arrayBufferToBase64 = buffer => {
    var binary = ''
    var bytes = [].slice.call(new Uint8Array(buffer))
    bytes.forEach(b => (binary += String.fromCharCode(b)))
    return window.btoa(binary)
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
            imageList: imageList,
            selection: imageList.map(() => false)
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

  gridItemSelected = (e, index) => {
    const shiftPressed = e.shiftKey
    this.setState(prevState => {
      const newSelection = prevState.selection
      let lastSelected = this.state.lastSelected
      if (shiftPressed && lastSelected !== null) {
        const sortedSelect = [lastSelected, index].sort()
        for (let i = sortedSelect[0]; i <= sortedSelect[1]; i++) {
          newSelection[i] = prevState.selection[lastSelected]
        }
      } else {
        newSelection[index] = !prevState.selection[index]
        lastSelected = index
      }
      if (newSelection.filter(item => item).length == 0) {
        lastSelected = null
      }
      return {
        selection: newSelection,
        lastSelected: lastSelected
      }
    })
  }

  deselectAll = () => {
    this.setState(prevState => ({
      selection: prevState.selection.map(() => false),
      lastSelected: null
    }))
  }

  createLabel = labelName => {
    // We also need insert this into the json of our object storage
    const newCollection = [
      ...this.state.collection,
      {
        label: labelName,
        images: []
      }
    ]

    this.setState({
      collection: newCollection
    })
  }

  getDataTransferItems = event => {
    let dataTransferItemsList = []
    if (event.dataTransfer) {
      const dt = event.dataTransfer
      if (dt.files && dt.files.length) {
        dataTransferItemsList = dt.files
      } else if (dt.items && dt.items.length) {
        // During the drag even the dataTransfer.files is null
        // but Chrome implements some drag store, which is accesible via dataTransfer.items
        return Array.prototype.slice
          .call(dt.items)
          .filter(item => item.kind === 'file')
      }
    } else if (event.target && event.target.files) {
      dataTransferItemsList = event.target.files
    }
    // Convert from DataTransferItemsList to the native Array
    return Array.prototype.slice.call(dataTransferItemsList)
  }

  onFileChosen = e => {
    const fileList = this.getDataTransferItems(e)

    this.setState(prevState => {
      const blankImages = Array(fileList.length).fill(
        'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      )
      const newCollection = prevState.collection.map(item => {
        if (item.label === 'Unlabeled') {
          const newImages = [...blankImages, ...item.images]
          item.images = newImages
          return item
        }
        return item
      })
      return {
        collection: newCollection,
        selection: [
          ...Array(fileList.length).fill(false),
          ...prevState.selection.map(() => false)
        ], // This might not be the most effective.
        lastSelected: null
      }
    })

    fileList.map((file, index) => {
      var reader = new FileReader()
      reader.onload = () => {
        var img = new Image()
        img.onload = () => {
          const c = window.document.createElement('canvas')
          const ctx = c.getContext('2d')
          c.width = 224
          c.height = 224
          ctx.drawImage(img, 0, 0, 224, 224)
          console.log(c.toDataURL('image/jpeg'))

          const dataURL = c.toDataURL('image/jpeg')

          this.setState(prevState => {
            const newCollection = prevState.collection.map(item => {
              if (item.label === 'Unlabeled') {
                const newImages = item.images
                newImages[index] = dataURL
                item.images = newImages
                return item
              }
              return item
            })
            return { collection: newCollection }
          })

          c.toBlob(result => {
            console.log(result)
            const randomName =
              Math.random()
                .toString(36)
                .substring(2, 15) +
              Math.random()
                .toString(36)
                .substring(2, 15)
            console.log(randomName)
            const url = `api/upload/my-first-project/${randomName}.JPG`
            const options = {
              method: 'PUT',
              body: result
            }
            const request = new Request(url)
            fetch(request, options)
              .then(response => {})
              .catch(error => {
                console.error(error)
              })
          }, 'image/jpeg')
        }
        img.src = reader.result
      }

      reader.readAsDataURL(file)
    })
    console.log(fileList)
  }

  render() {
    const selectionCount = this.state.selection
      ? this.state.selection.filter(item => item).length
      : 0

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
            <input type="file" onChange={this.onFileChosen} multiple />
          </div>
        </div>
        <div className="App-LowBar">
          <div className="App-LowBar-Grid">
            <div className="App-LowBar-Tabs">
              <div className="App-LowBar-Tab --Active">Images</div>
              <div className="App-LowBar-Tab">Train</div>
              <div className="App-LowBar-Tab">Evaluate</div>
              <div className="App-LowBar-Tab">Predict</div>
            </div>
          </div>
        </div>
        <SelectionBar
          selectionCount={selectionCount}
          deselectAll={this.deselectAll}
        />
        <Sidebar
          collection={this.state.collection}
          createLabel={this.createLabel}
        />
        <div className={`App-Parent ${selectionCount > 0 ? '--Active' : ''}`}>
          <ImageGrid
            collection={this.state.collection}
            selection={this.state.selection}
            gridItemSelected={this.gridItemSelected}
          />
        </div>
      </div>
    )
  }
}

export default App
