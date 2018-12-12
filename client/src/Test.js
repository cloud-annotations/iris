import React, { Component } from 'react'
import fetchImages from './api/fetchImages'
import GridController from './Grid/GridController'
import ImageTile from './ImageTile'
import BucketBar from './BucketBar'
import EmptySet from './EmptySet'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import SelectionBar from './SelectionBar'
import localforage from 'localforage'
import { Loading } from 'carbon-components-react'
import Dropzone from 'react-dropzone'
import GoogleAnalytics from 'react-ga'
import {
  validateCookies,
  generateUUID,
  getDataTransferItems,
  arrayBufferToBase64,
  readFile,
  shrinkImage,
  canvasToBlob,
  handleErrors
} from './Utils'
import './App.css'

const Canvas = props => {
  const imageRef = React.createRef()
  const canvasRef = React.createRef()

  const loadImage = imageUrl => {
    const url = `/api/proxy/${localStorage.getItem('loginUrl') ||
      ''}/beer-workshop/${imageUrl}`
    const options = {
      method: 'GET'
    }
    const request = new Request(url)
    fetch(request, options)
      .then(response => {
        if (response.status !== 200) {
          return Promise.reject('Status not 200!')
        }
        return response.arrayBuffer()
      })
      .then(buffer => {
        const base64Flag = 'data:image/jpeg;base64,'
        const imageStr = arrayBufferToBase64(buffer)

        imageRef.current.onload = () => {
          // const ctx = this.canvasRef.getContext('2d')
          // this.canvasRef.width = image.width
          // this.canvasRef.height = image.height
          // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
          // this.canvasRef.appendChild(image)
          // ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height)

          function setMousePosition(e, canvas) {
            var rect = canvas.getBoundingClientRect()
            mouse.x = Math.round(e.clientX - rect.left)
            mouse.y = Math.round(e.clientY - rect.top)
            // console.log('X: ' + mouse.x + ' Y: ' + mouse.y)
          }

          var mouse = {
            x: 0,
            y: 0,
            startX: 0,
            startY: 0
          }
          var element = null

          canvasRef.current.onmousemove = e => {
            setMousePosition(e, canvasRef.current)
            if (element !== null) {
              element.style.width = Math.abs(mouse.x - mouse.startX) + 'px'
              element.style.height = Math.abs(mouse.y - mouse.startY) + 'px'
              element.style.left =
                mouse.x - mouse.startX < 0
                  ? mouse.x + 'px'
                  : mouse.startX + 'px'
              element.style.top =
                mouse.y - mouse.startY < 0
                  ? mouse.y + 'px'
                  : mouse.startY + 'px'
            }
          }

          canvasRef.current.onclick = e => {
            if (element !== null) {
              element = null
              canvasRef.current.style.cursor = 'default'
              console.log('finsihed.')
            } else {
              console.log('begun.')
              mouse.startX = mouse.x
              mouse.startY = mouse.y
              element = document.createElement('div')
              element.style.left = mouse.x + 'px'
              element.style.top = mouse.y + 'px'
              element.style.cssText =
                'position: absolute; border: 1px solid rgba(0, 185, 225, 1.0); background-color: rgba(0, 185, 225, 0.0)'
              canvasRef.current.appendChild(element)

              const element2 = document.createElement('div')
              element2.style.cssText =
                'position: absolute; left: -2px; right: -2px; top: -2px; bottom: -2px; border: 1px solid rgba(225, 225, 225, 0.0); mix-blend-mode: difference;'
              element.appendChild(element2)

              canvasRef.current.style.cursor = 'crosshair'
            }
          }
        }
        imageRef.current.src = base64Flag + imageStr
      })
      .catch(error => {
        console.error(error)
      })
  }
  loadImage('01bec6fa-f2a3-41a0-a547-891ea7f50e5d.jpg')
  return (
    <div
      style={{ margin: '20px', cursor: 'crosshair', position: 'relative' }}
      ref={canvasRef}
    >
      <img ref={imageRef} />
    </div>
  )
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////// ORIGINAL COMPONENT //
//////////////////////////////////////////////////////////////////////////////////////////////////////

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
      selection: null,
      dropzoneActive: false
    }
  }

  componentDidMount() {
    GoogleAnalytics.pageview('annotations')
    const intervalID = setInterval(this.handleCookieChange, 10 * 1000)
    this.setState({
      intervalID: intervalID
    })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalID)
  }

  initializeData = () => {
    const { bucket } = this.props.match.params
    fetchImages(localStorage.getItem('loginUrl'), bucket)
      .then(res => {
        this.setState({
          loading: false,
          ...res
        })
      })
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

  handleCookieChange = () => {
    console.log('tic toc')
    validateCookies().catch(error => {
      console.error(error)
      if (error.message === 'Forbidden') {
        this.props.history.push('/login')
      }
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
              const url = `/api/proxy/${localStorage.getItem('loginUrl')}/${
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

    const url = `/api/proxy/${localStorage.getItem('loginUrl')}/${
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

    const url = `/api/proxy/${localStorage.getItem('loginUrl')}/${
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
            const url = `/api/proxy/${localStorage.getItem('loginUrl')}/${
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

  onSelectionChanged = selection => {
    this.setState({
      selection: selection
    })
  }

  render() {
    const selectionCount = this.state.selection
      ? this.state.selection.filter(item => item).length
      : 0

    const visibleLabels = this.state.labelList.filter(label => {
      return (
        this.state.currentSection === ALL_IMAGES ||
        (this.state.currentSection === LABELED && label !== 'Unlabeled') ||
        (this.state.currentSection === UNLABELED && label === 'Unlabeled') ||
        this.state.currentSection === label
      )
    })

    const visibleCollection = visibleLabels.reduce((acc, label) => {
      acc[label] = this.state.collection[label]
      return acc
    }, {})

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
          <Canvas />
          <GridController
            sections={visibleLabels}
            collection={visibleCollection}
            selection={this.state.selection}
            onSelectionChanged={this.onSelectionChanged}
            gridItem={<ImageTile bucket={this.props.match.params.bucket} />}
          />
        </Dropzone>
      </div>
    )
  }
}

export default App
