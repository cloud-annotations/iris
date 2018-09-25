import React, { Component } from 'react'
import ImageGrid from './ImageGrid'
import Sidebar from './Sidebar'
import SelectionBar from './SelectionBar'
import './App.css'

const EMPTY_IMAGE =
  'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

/**
  // This let's us loop through the collection easily.
  LabelList = [Label, Label, ...]

  Collection = {
    Label: [PointerToImage, PointerToImage, ...]
    Label: [PointerToImage, PointerToImage, ...]
    Label: [PointerToImage, PointerToImage, ...]
    Label: [PointerToImage, PointerToImage, ...]
    Label: [PointerToImage, PointerToImage, ...]
  }

  // We could turn this into some sort of cache.
  ImageCluster = {
    ImagePointer: {
      data: Base64String
    },
    ImagePointer: {
      data: Base64String
    }
  }
*/

class App extends Component {
  constructor(props) {
    super(props)
    this.initializeData()
    this.state = {
      labelList: ['Unlabeled'],
      collection: { Unlabeled: [] },
      imageCluster: {},
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

  initializeData = () => {
    this.populateLabels()
      .then(() => this.populateUnlabeled())
      .then(() => this.loadImages())
  }

  populateLabels = () => {
    return new Promise((resolve, reject) => {
      const url = `api/image/_labels.csv`
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      const labels = fetch(request, options)
        .then(response => response.text())
        .catch(error => {
          console.error(error)
        })

      const url2 = `api/image/_annotations.csv`
      const request2 = new Request(url2)
      const annotations = fetch(request2, options)
        .then(response => response.text())
        .catch(error => {
          console.error(error)
        })

      Promise.all([labels, annotations]).then(values => {
        this.setState(prevState => {
          const labelsCsv = values[0]
          const annotationsCsv = values[1]

          const labelMap = {}
          let urls = []

          const newCollection = prevState.collection
          let newLabelList = prevState.labelList

          const labels = labelsCsv.split('\n')
          labels.map(label => {
            // Account for empty lines.
            if (label === '') {
              return
            }
            const [key, value] = label.split(',')
            labelMap[key] = value
            newLabelList = [...newLabelList, value]
            newCollection[value] = []
          })

          const annotations = annotationsCsv.split('\n')
          annotations.map(annotation => {
            // Account for empty lines.
            if (annotation === '') {
              return
            }
            const [url, key] = annotation.split(',')
            newCollection[labelMap[key]] = [
              url,
              ...newCollection[labelMap[key]]
            ]
            urls = [...urls, url]
          })

          const imageCluster = urls.reduce((acc, item) => {
            acc[item] = { data: EMPTY_IMAGE }
            return acc
          }, {})

          return {
            collection: newCollection,
            labelList: newLabelList,
            imageCluster: imageCluster
          }
        }, resolve)
      })
    })
  }

  populateUnlabeled = () => {
    return new Promise((resolve, reject) => {
      const url = 'api/list'
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      fetch(request, options)
        .then(response => response.json())
        .then(str =>
          new window.DOMParser().parseFromString(str.xml, 'text/xml')
        )
        .then(data => {
          const elements = data.getElementsByTagName('Contents')
          const imageList = Array.prototype.map
            .call(elements, element => {
              return element.getElementsByTagName('Key')[0].innerHTML
            })
            .filter(fileName => {
              return fileName.match(/.(jpg|jpeg|png)$/i) // Make sure the extension is an image.
            })

          this.setState(prevState => {
            const newCollection = prevState.collection

            const newImageCluster = imageList.reduce((acc, item) => {
              if (acc[item] == null) {
                newCollection['Unlabeled'] = [
                  ...newCollection['Unlabeled'],
                  item
                ]
              }
              acc[item] = { data: EMPTY_IMAGE }
              return acc
            }, prevState.imageCluster)
            return {
              imageCluster: newImageCluster,
              selection: Object.keys(newImageCluster).map(() => false)
            }
          }, resolve)
        })
        .catch(error => {
          console.error(error)
        })
    })
  }

  loadImages = () => {
    // We don't care about the order, we just need to download all the images.
    // The `Keys` of the image cluster are the urls.
    Object.keys(this.state.imageCluster).map(imageUrl => {
      const url = `api/image/${imageUrl}`
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      fetch(request, options)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          this.setState(prevState => {
            const base64Flag = 'data:image/jpeg;base64,'
            const imageStr = this.arrayBufferToBase64(buffer)
            const newCluster = { ...prevState.imageCluster }
            newCluster[imageUrl] = { data: base64Flag + imageStr }
            return {
              imageCluster: newCluster
            }
          })
        })
        .catch(error => {
          console.error(error)
        })
    })
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

  gridItemSelected = (e, index) => {
    const shiftPressed = e.shiftKey
    this.setState(prevState => {
      const newSelection = prevState.selection
      let lastSelected = this.state.lastSelected
      if (shiftPressed && lastSelected !== null) {
        // The default sort for arrays in Javascript is an alphabetical search.
        const sortedSelect = [lastSelected, index].sort((a, b) => a - b)

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

  labelImages = () => {
    console.log('LABEL')
    this.setState(prevState => {
      let newCollection = { ...prevState.collection }
      
      let count = 0
      prevState.labelList.map(label => {
        const section = [...newCollection[label]]
        // copy everything to the new label and filter the section to remove the copied elements.
        const newSection = section.filter((imageName, i) => {
          if (prevState.selection[i + count]) {
            const oldList = newCollection[label]
            newCollection['Boats'] = [...newCollection['Boats'], oldList[i]]
            return false
          }
          return true
        })

        newCollection[label] = newSection
        count += section.length
      })

      return {
        collection: newCollection
      }
    })
  }

  deleteImages = () => {
    const newCollection = { ...this.state.collection }
    const flattenedImages = this.state.labelList.reduce((acc, label) => {
      return [...acc, ...newCollection[label]]
    }, [])

    console.log(flattenedImages)
    flattenedImages.map((imageName, i) => {
      if (this.state.selection[i]) {
        const url = `api/delete/my-first-project/${imageName}`
        const options = {
          method: 'DELETE'
        }
        const request = new Request(url)
        fetch(request, options)
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            console.error(error)
          })
      }
    })
  }

  createLabel = labelName => {
    this.setState(prevState => {
      const newCollection = { ...prevState.collection }
      const newLabelList = [...prevState.labelList, labelName]

      newCollection[labelName] = []

      return { collection: newCollection, labelList: newLabelList }
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
    const filesWithNames = fileList.map(file => {
      const randomName =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15)
      return { file: file, fileName: randomName }
    })

    this.setState(prevState => {
      const newCollection = { ...prevState.collection }
      const newImageCluster = { ...prevState.imageCluster }

      newCollection['Unlabeled'] = filesWithNames.reduce(
        (acc, fileWithName) => {
          newImageCluster[fileWithName.fileName] = { data: EMPTY_IMAGE }
          return [fileWithName.fileName, ...acc]
        },
        newCollection['Unlabeled']
      )

      const newSelection = Object.keys(newCollection).reduce((acc, key) => {
        return [...acc, ...newCollection[key].map(() => false)]
      }, [])

      return {
        collection: newCollection,
        imageCluster: newImageCluster,
        selection: newSelection,
        lastSelected: null
      }
    })

    filesWithNames.map(fileWithName => {
      const fileName = fileWithName.fileName
      const file = fileWithName.file
      this.readFile(file)
        .then(image => this.shrinkImage(image))
        .then(canvas => {
          const dataURL = canvas.toDataURL('image/jpeg')

          this.setState(prevState => {
            const newImageCluster = { ...prevState.imageCluster }
            newImageCluster[fileName] = { data: dataURL }
            return { imageCluster: newImageCluster }
          })

          return this.canvasToBlob(canvas)
        })
        .then(blob => {
          const url = `api/upload/my-first-project/${fileName}.JPG`
          const options = {
            method: 'PUT',
            body: blob
          }
          const request = new Request(url)
          return fetch(request, options)
        })
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.error(error)
        })
    })
    console.log(fileList)
  }

  readFile = file => {
    return new Promise((resolve, reject) => {
      var reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(file)
    })
  }

  shrinkImage = imageSrc => {
    return new Promise((resolve, reject) => {
      var img = new Image()
      img.onload = () => {
        const c = window.document.createElement('canvas')
        const ctx = c.getContext('2d')
        c.width = 224
        c.height = 224
        ctx.drawImage(img, 0, 0, 224, 224)

        resolve(c)
      }
      img.src = imageSrc
    })
  }

  canvasToBlob = canvas => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(result => {
        resolve(result)
      }, 'image/jpeg')
    })
  }

  render() {
    const selectionCount = this.state.selection
      ? this.state.selection.filter(item => item).length
      : 0

    return (
      <div>
        <div className="App-TopBar">
          <div className="App-TopBar-Title">Annotate ML</div>
          <div className="App-TopBar-BreadCrumb">
            &nbsp;/&nbsp;
            <a href="#TODO" className="App-TopBar-ServiceID">
              cloud-object-storage-qf
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
        <SelectionBar
          selectionCount={selectionCount}
          deselectAll={this.deselectAll}
          labelImages={this.labelImages}
          deleteImages={this.deleteImages}
        />
        <Sidebar
          sections={this.state.labelList}
          collection={this.state.collection}
          createLabel={this.createLabel}
        />
        <div className={`App-Parent ${selectionCount > 0 ? '--Active' : ''}`}>
          <ImageGrid
            sections={this.state.labelList}
            collection={this.state.collection}
            images={this.state.imageCluster}
            selection={this.state.selection}
            gridItemSelected={this.gridItemSelected}
          />
        </div>
      </div>
    )
  }
}

export default App
