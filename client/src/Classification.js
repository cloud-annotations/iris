import React, { Component } from 'react'
import fetchImages from 'api/fetchImages'
import GridController from 'common/Grid/GridController'
import ImageTile from './ImageTile'
import EmptySet from './EmptySet'
import SelectionBar from './SelectionBar'
import Sidebar, { ALL_IMAGES, UNLABELED, LABELED } from './Sidebar'
import './App.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.initializeData()
    this.state = {
      labelList: ['Unlabeled'],
      collection: { Unlabeled: [] },
      selection: null,
      dropzoneActive: false,
      cookieCheckInterval: null
    }
  }

  initializeData = () => {
    const { bucket, onDataLoaded } = this.props
    fetchImages(localStorage.getItem('loginUrl'), bucket)
      .then(res => {
        onDataLoaded()
        this.setState({ ...res })
      })
      .catch(error => {
        console.error(error)
        if (error.message === 'Forbidden') {
          this.props.history.push('/login')
        }
      })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentSection !== this.props.currentSection) {
      this.deselectAll()
    }
  }

  deselectAll = () => {
    this.setState(prevState => {
      const selection =
        prevState.selection && prevState.selection.map(() => false)
      return {
        selection: selection,
        lastSelected: null
      }
    })
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
                this.props.bucket
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
      this.props.bucket
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
      this.props.bucket
    }/_annotations.csv`
    const options = {
      method: 'PUT',
      body: blob
    }
    const request = new Request(url)
    return fetch(request, options)
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
        this.props.currentSection === ALL_IMAGES ||
        (this.props.currentSection === LABELED && label !== 'Unlabeled') ||
        (this.props.currentSection === UNLABELED && label === 'Unlabeled') ||
        this.props.currentSection === label
      )
    })

    const visibleCollection = visibleLabels.reduce((acc, label) => {
      acc[label] = this.state.collection[label]
      return acc
    }, {})

    return (
      <div>
        <SelectionBar
          selectionCount={selectionCount}
          sections={this.state.labelList}
          deselectAll={this.deselectAll}
          labelImages={this.labelImages}
          createLabel={this.createLabel}
          deleteImages={this.deleteImages}
        />
        <EmptySet
          forceHide={this.state.loading}
          currentSection={this.props.currentSection}
          sections={this.state.labelList}
          collection={this.state.collection}
        />
        <GridController
          className="Classification-Grid"
          sections={visibleLabels}
          collection={visibleCollection}
          selection={this.state.selection}
          onSelectionChanged={this.onSelectionChanged}
          gridItem={<ImageTile bucket={this.props.bucket} />}
        />
      </div>
    )
  }
}
