import React, { Component } from 'react'
import ImageGrid from './ImageGrid'
import Sidebar, { ALL_IMAGES, LABELED, UNLABELED } from './Sidebar'
import SelectionBar from './SelectionBar'
import localforage from 'localforage'
import {
  getCookie,
  generateUUID,
  getDataTransferItems,
  readFile,
  shrinkImage,
  canvasToBlob
} from './Utils'
import './App.css'

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
*/

class App extends Component {
  constructor(props) {
    super(props)
    this.initializeData()
    this.state = {
      labelList: ['Unlabeled'],
      collection: { Unlabeled: [] },
      currentSection: ALL_IMAGES,
      selection: [],
      tmpLabeledImages: new Set([]),
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
    const cookie = getCookie('token')
    let emptyPromises = new Promise((resolve, reject) => {
      resolve()
    })

    if (cookie === '') {
      const apiKey = prompt('apikey')
      const url = 'api/auth?apikey=' + apiKey
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      emptyPromises = fetch(request, options)
    }

    emptyPromises
      .then(() => this.populateLabels())
      .then(() => this.populateUnlabeled())
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
          let urls = {}

          const newCollection = { ...prevState.collection }
          let newLabelList = [...prevState.labelList]

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

          return {
            collection: newCollection,
            labelList: newLabelList,
            tmpLabeledImages: new Set(urls)
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
            const newCollection = { ...prevState.collection }

            imageList.map(item => {
              if (!prevState.tmpLabeledImages.has(item)) {
                newCollection['Unlabeled'] = [
                  ...newCollection['Unlabeled'],
                  item
                ]
              }
            })

            const newSelection = Object.keys(newCollection).reduce(
              (acc, key) => {
                return [...acc, ...newCollection[key].map(() => false)]
              },
              []
            )

            return {
              collection: newCollection,
              selection: newSelection
            }
          }, resolve)
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

  gridItemSelected = (e, index) => {
    const shiftPressed = e.shiftKey
    this.setState(prevState => {
      const newSelection = [...prevState.selection]
      let lastSelected = prevState.lastSelected
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
      if (newSelection.filter(item => item).length === 0) {
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

  labelImages = newLabel => {
    this.setState(prevState => {
      let newCollection = { ...prevState.collection }

      let aNewArrayOfThingsToBeAdded = []

      let count = 0
      prevState.labelList.map(label => {
        const section = [...prevState.collection[label]]
        const newSection = section.filter((imageName, i) => {
          if (prevState.selection[i + count]) {
            // If the image is selected:

            // Copy the image to the new label in the collection
            aNewArrayOfThingsToBeAdded = [
              ...aNewArrayOfThingsToBeAdded,
              section[i]
            ]

            // Don't include it in the new section
            return false
          }
          return true
        })

        // Replace the current section with the filted section.
        newCollection[label] = newSection
        count += section.length
      })

      newCollection[newLabel] = [
        ...newCollection[newLabel],
        ...aNewArrayOfThingsToBeAdded
      ]

      return {
        collection: newCollection,
        selection: prevState.selection.map(() => false),
        lastSelected: null
      }
    })
  }

  // TODO: Look over this.
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

  chooseSection = label => {
    this.setState({
      currentSection: label
    })
  }

  onFileChosen = e => {
    const fileList = getDataTransferItems(e)
    const filesWithNames = fileList.map(file => {
      const fileName = generateUUID()
      return { file: file, fileName: `${fileName}.JPG` }
    })

    this.setState(prevState => {
      const newCollection = { ...prevState.collection }

      filesWithNames.map(fileWithName => {
        newCollection['Unlabeled'] = [
          `tmp_${fileWithName.fileName}`,
          ...newCollection['Unlabeled']
        ]
      })

      const newSelection = Object.keys(newCollection).reduce((acc, key) => {
        return [...acc, ...newCollection[key].map(() => false)]
      }, [])

      return {
        collection: newCollection,
        selection: newSelection,
        lastSelected: null
      }
    })

    filesWithNames.map(fileWithName => {
      const fileName = fileWithName.fileName
      const file = fileWithName.file
      return readFile(file)
        .then(image => shrinkImage(image))
        .then(canvas => {
          const dataURL = canvas.toDataURL('image/jpeg')
          return localforage.setItem(fileName, dataURL).then(() => {
            this.setState(prevState => {
              const newCollection = { ...prevState.collection }
              newCollection['Unlabeled'] = newCollection['Unlabeled'].map(
                image => {
                  if (image === `tmp_${fileName}`) {
                    return fileName
                  }
                  return image
                }
              )

              return {
                collection: newCollection
              }
            })
            return canvas
          })
        })
        .then(canvas => canvasToBlob(canvas))
        .then(blob => {
          const url = `api/upload/my-first-project/${fileName}`
          const options = {
            method: 'PUT',
            body: blob
          }
          const request = new Request(url)
          return fetch(request, options)
        })
        .catch(error => {
          console.error(error)
        })
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
          sections={this.state.labelList}
          deselectAll={this.deselectAll}
          labelImages={this.labelImages}
          deleteImages={this.deleteImages}
        />
        <Sidebar
          currentSection={this.state.currentSection}
          chooseSection={this.chooseSection}
          sections={this.state.labelList}
          collection={this.state.collection}
          createLabel={this.createLabel}
        />
        <div className={`App-Parent ${selectionCount > 0 ? '--Active' : ''}`}>
          <ImageGrid
            sections={this.state.labelList.filter(section => {
              if (this.state.currentSection === ALL_IMAGES) {
                return true
              }
              if (
                this.state.currentSection === LABELED &&
                section !== 'Unlabeled'
              ) {
                return true
              }
              if (
                this.state.currentSection === UNLABELED &&
                section === 'Unlabeled'
              ) {
                return true
              }
              if (this.state.currentSection === section) {
                return true
              }
            })}
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
