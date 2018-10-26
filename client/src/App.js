import React, { Component } from 'react'
import ImageGrid from './ImageGrid'
import BucketBar from './BucketBar'
import EmptySet from './EmptySet'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import SelectionBar from './SelectionBar'
import localforage from 'localforage'
import { Loading } from 'carbon-components-react'
import Dropzone from 'react-dropzone'
import {
  validateCookies,
  generateUUID,
  getDataTransferItems,
  readFile,
  shrinkImage,
  canvasToBlob,
  handleErrors
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
      saved: true,
      loading: true,
      labelList: ['Unlabeled'],
      collection: { Unlabeled: [] },
      currentSection: ALL_IMAGES,
      selection: [],
      tmpLabeledImages: new Set([]),
      lastSelected: null, // This does not include shift clicks.
      tmpSelection: null,
      dropzoneActive: false
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('mouseup', this.handleDragEnd)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('mouseup', this.handleDragEnd)
  }

  dragging = false
  dragStartIndex = null

  getColCount = () => {
    const grid = document.getElementsByClassName('ImageGrid')[0]
    return parseInt(
      window
        .getComputedStyle(grid, null)
        .getPropertyValue('grid-template-columns')
        .split('px').length - 1,
      10
    )
  }
  handleDragStart = index => {
    console.log(index)
    this.dragging = true
    this.dragStartIndex = index
  }
  handleDrag = index => {
    if (this.dragging) {
      let sectionMin = 0
      let sectionMax = 0
      for (let i = 0; i < this.state.labelList.length; i++) {
        const label = this.state.labelList[i]
        const sectionSize = this.state.collection[label].length
        const tmpSize = sectionMin + sectionSize
        if (tmpSize > this.dragStartIndex) {
          sectionMax = tmpSize
          break
        }
        sectionMin = tmpSize
      }

      const colCount = this.getColCount()
      const normalizedStartIndex = this.dragStartIndex - sectionMin
      const normalizedEndIndex = index - sectionMin

      const x1 = normalizedStartIndex % colCount
      const y1 = Math.floor(normalizedStartIndex / colCount)
      const x2 = normalizedEndIndex % colCount
      const y2 = Math.floor(normalizedEndIndex / colCount)

      console.log(`(${x1}, ${y1}) -> (${x2}, ${y2})`)

      this.setState(prevState => {
        const newTmpSelection = prevState.selection.map(
          (selectState, index) => {
            if (sectionMin <= index && index < sectionMax) {
              const normalizedIndex = index - sectionMin
              const x = normalizedIndex % colCount
              const y = Math.floor(normalizedIndex / colCount)

              if (Math.min(y2, y1) <= y && y <= Math.max(y2, y1)) {
                if (Math.min(x2, x1) <= x && x <= Math.max(x2, x1)) {
                  return true
                }
              }
            }
            return selectState
          }
        )

        return {
          tmpSelection: newTmpSelection
        }
      })
    }
  }
  handleDragEnd = () => {
    if (this.dragging) {
      this.setState(prevState => {
        const newSelection = prevState.tmpSelection || prevState.selection
        let newLastSelect = prevState.lastSelected
        if (prevState.tmpSelection !== null) {
          newLastSelect = null
        }
        return {
          selection: newSelection,
          lastSelected: newLastSelect,
          tmpSelection: null
        }
      })
    }
    this.dragging = false
    this.dragStartIndex = null
    this.dragEndIndex = null
  }

  initializeData = () => {
    validateCookies()
      .then(this.fetchFileList)
      .then(this.populateLabels)
      .then(this.populateUnlabeled)
      .catch(error => {
        console.error(error)
        this.setState({
          loading: false
        })
        if (error.message === 'Forbidden') {
          this.props.history.push('/login')
        }
      })
  }

  // TODO: Handle pages larger than 1000.
  fetchFileList = () => {
    return new Promise((resolve, reject) => {
      const url = `api/proxy/${localStorage.getItem('loginUrl')}/${
        this.props.match.params.bucket
      }`
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      fetch(request, options)
        .then(handleErrors)
        .then(response => response.json())
        .then(str =>
          new window.DOMParser().parseFromString(str.xml, 'text/xml')
        )
        .then(data => {
          const elements = data.getElementsByTagName('Contents')
          const fileList = Array.prototype.map.call(elements, element => {
            return element.getElementsByTagName('Key')[0].innerHTML
          })
          return resolve(fileList)
        })
        .catch(reject)
    })
  }

  populateLabels = fileList => {
    return new Promise((resolve, reject) => {
      if (
        !fileList.includes('_labels.csv') ||
        !fileList.includes('_annotations.csv')
      ) {
        return resolve(fileList)
      }

      const url = `api/proxy/${localStorage.getItem('loginUrl')}/${
        this.props.match.params.bucket
      }/_labels.csv`
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      const labels = fetch(request, options)
        .then(handleErrors)
        .then(response => response.text())
        .catch(reject)

      const url2 = `api/proxy/${localStorage.getItem('loginUrl')}/${
        this.props.match.params.bucket
      }/_annotations.csv`
      const request2 = new Request(url2)
      const annotations = fetch(request2, options)
        .then(handleErrors)
        .then(response => response.text())
        .catch(reject)

      Promise.all([labels, annotations]).then(values => {
        this.setState(
          prevState => {
            const labelsCsv = values[0]
            const annotationsCsv = values[1]

            let urls = []

            const newCollection = { ...prevState.collection }
            let newLabelList = [...prevState.labelList]

            const labels = labelsCsv.split('\n')
            labels.forEach(label => {
              label = label.trim()
              // Account for empty lines.
              if (label !== '') {
                newLabelList = [...newLabelList, label]
                newCollection[label] = []
              }
            })

            const annotations = annotationsCsv.split('\n')
            annotations.forEach(annotation => {
              // Account for empty lines.
              if (annotation !== '') {
                const [url, label] = annotation.split(',')
                const trimedLabel = label.trim()

                if (trimedLabel in newCollection) {
                  newCollection[trimedLabel] = [
                    url,
                    ...newCollection[trimedLabel]
                  ]

                  urls = [...urls, url]
                }
              }
            })

            return {
              collection: newCollection,
              labelList: newLabelList,
              tmpLabeledImages: new Set(urls)
            }
          },
          () => {
            resolve(fileList)
          }
        )
      })
    })
  }

  populateUnlabeled = fileList => {
    return new Promise((resolve, reject) => {
      const imageList = fileList.filter(fileName => {
        return fileName.match(/.(jpg|jpeg|png)$/i) // Make sure the extension is an image.
      })

      this.setState(prevState => {
        const newCollection = { ...prevState.collection }

        imageList.forEach(item => {
          if (!prevState.tmpLabeledImages.has(item)) {
            newCollection['Unlabeled'] = [...newCollection['Unlabeled'], item]
          }
        })

        const newSelection = Object.keys(newCollection).reduce((acc, key) => {
          return [...acc, ...newCollection[key].map(() => false)]
        }, [])

        return {
          loading: false,
          collection: newCollection,
          selection: newSelection
        }
      }, resolve)
    })
  }

  changeRequest = changePromise => {
    console.log('save')
    this.setState(
      {
        saved: false
      },
      () => {
        changePromise
          .then(() => {
            console.log('done')
            this.setState({
              saved: true
            })
          })
          .catch(error => {
            console.error(error)
          })
      }
    )
  }

  handleKeyDown = event => {
    let charCode = String.fromCharCode(event.which).toLowerCase()
    // For MAC we can use metaKey to detect cmd key
    if ((event.ctrlKey || event.metaKey) && charCode === 'a') {
      event.preventDefault()
      this.setState(prevState => {
        const cSection = prevState.currentSection

        // TODO: clean this up.
        let startOfSection = 0
        let endOfSection = 0
        if (cSection === ALL_IMAGES) {
          prevState.labelList.forEach(section => {
            endOfSection += prevState.collection[section].length
          })
        } else if (cSection === LABELED) {
          prevState.labelList.forEach(section => {
            if (section === 'Unlabeled') {
              startOfSection += prevState.collection[section].length
            }
            endOfSection += prevState.collection[section].length
          })
        } else if (cSection === UNLABELED) {
          prevState.labelList.forEach(section => {
            if (section === 'Unlabeled') {
              endOfSection += prevState.collection[section].length
            }
          })
        } else {
          prevState.labelList.forEach(section => {
            if (endOfSection > 0) {
              return
            }
            if (section !== cSection) {
              startOfSection += prevState.collection[section].length
            } else {
              endOfSection =
                startOfSection + prevState.collection[section].length
            }
          })
        }

        const newSelection = prevState.selection.map((_, index) => {
          if (startOfSection <= index && index < endOfSection) {
            return true
          }
          return false
        })

        return {
          selection: newSelection
        }
      })
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

        // Set the selection type (select/deselect) as the last selected type.
        let bool = prevState.selection[lastSelected]
        // Unless both the last and current selection are deselected.
        if (!prevState.selection[lastSelected] && !prevState.selection[index]) {
          bool = true
        }

        for (let i = sortedSelect[0]; i <= sortedSelect[1]; i++) {
          newSelection[i] = bool
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
    const promise = new Promise((resolve, reject) => {
      this.setState(
        prevState => {
          let newCollection = { ...prevState.collection }

          let aNewArrayOfThingsToBeAdded = []

          let count = 0
          prevState.labelList.forEach(label => {
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
        },
        () => {
          this.annotationsToCsv()
            .then(resolve)
            .catch(reject)
        }
      )
    })

    this.changeRequest(promise)
  }

  deleteImages = () => {
    let deleteRequests = []
    this.setState(
      prevState => {
        let newCollection = { ...prevState.collection }

        let count = 0
        prevState.labelList.forEach(label => {
          const section = [...prevState.collection[label]]
          const newSection = section.filter((imageName, i) => {
            if (prevState.selection[i + count]) {
              // If the image is selected:
              // Delete it from server.
              const url = `api/proxy/${localStorage.getItem('loginUrl')}/${
                this.props.match.params.bucket
              }/${imageName}`
              const options = {
                method: 'DELETE'
              }
              const request = new Request(url)
              const deleteRequest = fetch(request, options)
                .then(response => {
                  console.log(response)
                })
                .catch(error => {
                  console.error(error)
                })

              deleteRequests = [...deleteRequests, deleteRequest]
              // Don't include it in the new section
              return false
            }
            return true
          })

          // Replace the current section with the filted section.
          newCollection[label] = newSection
          count += section.length
        })

        const newSelection = Object.keys(newCollection).reduce((acc, key) => {
          return [...acc, ...newCollection[key].map(() => false)]
        }, [])

        return {
          collection: newCollection,
          selection: newSelection,
          lastSelected: null
        }
      },
      () => {
        const changes = Promise.all(deleteRequests)
        changes.then(() => this.annotationsToCsv())
        this.changeRequest(changes)
      }
    )
  }

  labelsToCsv = () => {
    const csvFile = this.state.labelList
      .filter(label => {
        return label !== 'Unlabeled'
      })
      .reduce((acc, label) => {
        return acc + label + '\r\n'
      }, '')

    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' })

    const url = `api/proxy/${localStorage.getItem('loginUrl')}/${
      this.props.match.params.bucket
    }/_labels.csv`
    const options = {
      method: 'PUT',
      body: blob
    }
    const request = new Request(url)
    return fetch(request, options)
  }

  annotationsToCsv = () => {
    const csvFile = this.state.labelList
      .filter(label => {
        return label !== 'Unlabeled'
      })
      .reduce((acc, label) => {
        return (
          acc +
          this.state.collection[label].reduce((acc, url) => {
            return acc + url + ',' + label + '\r\n'
          }, '')
        )
      }, '')

    console.log(csvFile)

    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' })

    const url = `api/proxy/${localStorage.getItem('loginUrl')}/${
      this.props.match.params.bucket
    }/_annotations.csv`
    const options = {
      method: 'PUT',
      body: blob
    }
    const request = new Request(url)
    return fetch(request, options)
  }

  createLabel = labelName => {
    const promise = new Promise((resolve, reject) => {
      this.setState(
        prevState => {
          const newCollection = { ...prevState.collection }
          const newLabelList = [...prevState.labelList, labelName]

          newCollection[labelName] = []

          return { collection: newCollection, labelList: newLabelList }
        },
        () => {
          this.labelsToCsv()
            .then(resolve)
            .catch(reject)
        }
      )
    })

    this.changeRequest(promise)
  }

  deleteLabel = labelName => {
    const promise = new Promise((resolve, reject) => {
      this.setState(
        prevState => {
          const newLabelList = prevState.labelList.filter(label => {
            return label !== labelName
          })

          const newCollection = prevState.labelList.reduce((acc, label) => {
            acc[label] = prevState.collection[label]
            return acc
          }, {})

          newCollection['Unlabeled'] = [
            ...prevState.collection[labelName],
            ...newCollection['Unlabeled']
          ]

          return { collection: newCollection, labelList: newLabelList }
        },
        () => {
          this.labelsToCsv()
            .then(resolve)
            .catch(reject)
        }
      )
    })

    this.changeRequest(promise)
  }

  chooseSection = label => {
    this.setState({
      currentSection: label
    })
    this.deselectAll()
  }

  onFileChosen = e => {
    const fileList = getDataTransferItems(e)
    this.uploadFiles(fileList)
  }

  uploadFiles = fileList => {
    const uploadRequest = new Promise((resolve, reject) => {
      const filesWithNames = fileList.map(file => {
        const fileName = generateUUID()
        return { file: file, fileName: `${fileName}.jpg` }
      })

      const label =
        this.state.currentSection === UNLABELED ||
        this.state.currentSection === LABELED ||
        this.state.currentSection === ALL_IMAGES
          ? 'Unlabeled'
          : this.state.currentSection

      this.setState(prevState => {
        const newCollection = { ...prevState.collection }

        filesWithNames.forEach(fileWithName => {
          newCollection[label] = [
            `tmp_${fileWithName.fileName}`,
            ...newCollection[label]
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

      var uploadRequests = []
      filesWithNames.forEach(fileWithName => {
        const fileName = fileWithName.fileName
        const file = fileWithName.file
        const promise = readFile(file)
          .then(image => shrinkImage(image))
          .then(canvas => {
            const dataURL = canvas.toDataURL('image/jpeg')
            return localforage.setItem(fileName, dataURL).then(() => {
              return new Promise((resolve, reject) => {
                this.setState(
                  prevState => {
                    const newCollection = { ...prevState.collection }
                    newCollection[label] = newCollection[label].map(image => {
                      if (image === `tmp_${fileName}`) {
                        return fileName
                      }
                      return image
                    })

                    return {
                      collection: newCollection
                    }
                  },
                  () => {
                    resolve(canvas)
                  }
                )
              })
            })
          })
          .then(canvas => canvasToBlob(canvas))
          .then(blob => {
            const url = `api/proxy/${localStorage.getItem('loginUrl')}/${
              this.props.match.params.bucket
            }/${fileName}`
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

        uploadRequests = [...uploadRequests, promise]
      })

      Promise.all(uploadRequests)
        .then(() => this.annotationsToCsv())
        .then(resolve)
        .catch(reject)
    })

    this.changeRequest(uploadRequest)
  }

  onDragEnter = () => {
    this.setState({
      dropzoneActive: true
    })
  }

  onDragLeave = () => {
    this.setState({
      dropzoneActive: false
    })
  }

  onDrop = files => {
    this.uploadFiles(files)
    this.setState({
      dropzoneActive: false
    })
  }

  render() {
    const selectionCount = this.state.selection
      ? this.state.selection.filter(item => item).length
      : 0

    return (
      <div>
        <BucketBar
          saved={this.state.saved}
          bucket={this.props.match.params.bucket}
          onChange={this.onFileChosen}
        />
        <SelectionBar
          selectionCount={selectionCount}
          sections={this.state.labelList}
          deselectAll={this.deselectAll}
          labelImages={this.labelImages}
          createLabel={this.createLabel}
          deleteImages={this.deleteImages}
        />
        <Sidebar
          currentSection={this.state.currentSection}
          chooseSection={this.chooseSection}
          sections={this.state.labelList}
          collection={this.state.collection}
          createLabel={this.createLabel}
          deleteLabel={this.deleteLabel}
        />
        <Dropzone
          disableClick
          className={`App-Parent ${selectionCount > 0 ? '--Active' : ''}`}
          style={{ position: 'fixed' }}
          accept="image/*"
          onDrop={this.onDrop}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >
          <Loading active={this.state.loading} />
          <div
            className={`App-DropTarget ${
              this.state.dropzoneActive ? '--Active' : ''
            }`}
          >
            <div className="App-DropTarget-outline">
              <div className="App-DropTarget-text">
                Drop to upload your images
              </div>
            </div>
          </div>
          <EmptySet
            forceHide={this.state.loading}
            currentSection={this.state.currentSection}
            sections={this.state.labelList}
            collection={this.state.collection}
          />
          <ImageGrid
            dragStart={this.handleDragStart}
            drag={this.handleDrag}
            bucket={this.props.match.params.bucket}
            sections={this.state.labelList}
            currentSection={this.state.currentSection}
            collection={this.state.collection}
            selection={this.state.tmpSelection || this.state.selection}
            gridItemSelected={this.gridItemSelected}
          />
        </Dropzone>
      </div>
    )
  }
}

export default App
