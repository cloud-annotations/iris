import React, { Component } from 'react'
import ImageGrid from './ImageGrid'
import BucketBar from './BucketBar'
import EmptySet from './EmptySet'
import Sidebar, { ALL_IMAGES } from './Sidebar'
import SelectionBar from './SelectionBar'
import localforage from 'localforage'
import { Loading } from 'carbon-components-react'
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

            const labelMap = {}
            let urls = {}

            const newCollection = { ...prevState.collection }
            let newLabelList = [...prevState.labelList]

            const labels = labelsCsv.split('\n')
            labels.forEach(label => {
              // Account for empty lines.
              if (label !== '') {
                const [key, value] = label.split(',')
                labelMap[key] = value
                newLabelList = [...newLabelList, value]
                newCollection[value] = []
              }
            })

            const annotations = annotationsCsv.split('\n')
            annotations.forEach(annotation => {
              // Account for empty lines.
              if (annotation !== '') {
                const [url, key] = annotation.split(',')
                newCollection[labelMap[key]] = [
                  url,
                  ...newCollection[labelMap[key]]
                ]
                urls = [...urls, url]
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
    })
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
        this.changeRequest(changes)
      }
    )
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
    const uploadRequest = new Promise((resolve, reject) => {
      const fileList = getDataTransferItems(e)
      const filesWithNames = fileList.map(file => {
        const fileName = generateUUID()
        return { file: file, fileName: `${fileName}.JPG` }
      })

      this.setState(prevState => {
        const newCollection = { ...prevState.collection }

        filesWithNames.forEach(fileWithName => {
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

      var uploadRequests = []
      filesWithNames.forEach(fileWithName => {
        const fileName = fileWithName.fileName
        const file = fileWithName.file
        const promise = readFile(file)
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
        .then(resolve)
        .catch(reject)
    })

    this.changeRequest(uploadRequest)
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
          <Loading active={this.state.loading} />
          <EmptySet
            forceHide={this.state.loading}
            currentSection={this.state.currentSection}
            sections={this.state.labelList}
            collection={this.state.collection}
          />
          <ImageGrid
            bucket={this.props.match.params.bucket}
            sections={this.state.labelList}
            currentSection={this.state.currentSection}
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
