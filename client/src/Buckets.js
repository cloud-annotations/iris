import React, { Component } from 'react'
import {
  DataTable,
  DataTableSkeleton,
  Modal,
  TextInput,
  Loading
} from 'carbon-components-react'
import { validateCookies, handleErrors } from './Utils'
import 'carbon-components/css/carbon-components.min.css'
import './Buckets.css'

const {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader
} = DataTable

const INVALID_CHARS =
  'Must start and end in alphanumeric characters (from 3 to 255) limited to: lowercase, numbers and non-consecutive dots, and hyphens.'
const TOO_SHORT = 'Must be at least 3 characters'
const NAME_EXISTS =
  'This bucket name already exists in IBM Cloud Object Storage. Create a new globally unique name.'
const EMPTY_NAME = 'Bucket name is required.'

class Buckets extends Component {
  constructor(props) {
    super(props)
    this.initializeData()
    this.state = {
      buckets: null,
      modalOpen: false,
      textInputBucketName: '',
      invalidText: '',
      invalid: false,
      loading: false
    }
  }

  initializeData = () => {
    validateCookies()
      .then(() => this.populateBuckets())
      .catch(error => {
        console.error(error)
        if (error.message === 'Forbidden') {
          this.props.history.push('/login')
        }
      })
  }

  populateBuckets = () => {
    return new Promise((resolve, reject) => {
      const url = `api/proxy/${localStorage.getItem(
        'loginUrl'
      )}?resourceId=${localStorage.getItem('resourceId')}`
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
          console.log(data)
          const elements = data.getElementsByTagName('Bucket')
          const bucketList = Array.prototype.map.call(elements, element => {
            const name = element.getElementsByTagName('Name')[0].innerHTML
            const date = element.getElementsByTagName('CreationDate')[0]
              .innerHTML
            return {
              id: name,
              name: name,
              created: new Date(date).toLocaleDateString()
            }
          })
          this.setState({ buckets: bucketList }, resolve)
        })
        .catch(reject)
    })
  }

  openModal = () => {
    this.setState({
      modalOpen: true
    })
  }

  closeModal = () => {
    this.setState({
      modalOpen: false
    })
  }

  onTextChange = e => {
    const bucketName =
      e.target.value
        .toLowerCase()
        .replace(/\s/g, '')
        .trim() || ''
    this.setState({
      textInputBucketName: bucketName
    })
    if (RegExp(/[^a-z0-9-.]|[.-][.-]+/g).test(bucketName)) {
      this.setState({
        invalidText: INVALID_CHARS,
        invalid: true
      })
    } else {
      this.setState({
        invalidText: '',
        invalid: false
      })
    }
  }

  createBucket = () => {
    const bucketName = this.state.textInputBucketName

    if (bucketName === '') {
      this.setState({
        invalidText: EMPTY_NAME,
        invalid: true
      })
      return
    }

    if (bucketName.length < 3) {
      this.setState({
        invalidText: TOO_SHORT,
        invalid: true
      })
      return
    }

    if (
      RegExp(/^[^a-z0-9]+|[^a-z0-9]+$|[^a-z0-9-.]|[.-][.-]+/g).test(bucketName)
    ) {
      this.setState({
        invalidText: INVALID_CHARS,
        invalid: true
      })
      return
    }

    this.setState(
      {
        loading: true
      },
      () => {
        const url = `api/proxy/${localStorage.getItem(
          'loginUrl'
        )}/${bucketName}?resourceId=${localStorage.getItem('resourceId')}`
        const options = {
          method: 'PUT'
        }
        const request = new Request(url)
        fetch(request, options)
          .then(handleErrors)
          .then(() => {
            this.setState(
              {
                loading: false,
                invalidText: '',
                invalid: false
              },
              () => {
                this.closeModal()
                this.initializeData()
              }
            )
          })
          .catch(error => {
            if (error.message === 'Conflict') {
              this.setState({
                loading: false,
                invalidText: NAME_EXISTS,
                invalid: true
              })
            } else {
              this.setState({
                loading: false,
                invalidText: error.message.toString(),
                invalid: true
              })
            }
          })
      }
    )
  }

  render() {
    const headers = [
      { key: 'name', header: 'NAME' },
      { key: 'created', header: 'CREATED' }
    ]
    return (
      <div className="Buckets-Parent">
        <Modal
          className="Buckets-Modal-TextInput-Wrapper"
          open={this.state.modalOpen}
          shouldSubmitOnEnter={true}
          modalHeading="Bucket name"
          primaryButtonText="Confirm"
          secondaryButtonText="Cancel"
          onRequestClose={this.closeModal}
          onRequestSubmit={this.createBucket}
          onSecondarySubmit={this.closeModal}
        >
          <Loading active={this.state.loading} />
          <TextInput
            className="Buckets-Modal-TextInput"
            placeholder="Name"
            onChange={this.onTextChange}
            value={this.state.textInputBucketName}
            invalidText={this.state.invalidText}
            invalid={this.state.invalid}
            data-modal-primary-focus
          />
        </Modal>

        <div className="Buckets-Table">
          <div className="Buckets-TableHeader">
            <div className="Buckets-TableHeader-title">Buckets</div>
            <div
              className="Buckets-createBucket-Button"
              onClick={this.openModal}
            >
              Create bucket
              <svg className="Buckets-createBucket-Icon" viewBox="0 0 16 16">
                <path d="M7 7H4v2h3v3h2V9h3V7H9V4H7v3zm1 9A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
              </svg>
            </div>
          </div>
          {this.state.buckets ? (
            <DataTable
              rows={this.state.buckets}
              headers={headers}
              render={({ rows, headers, getHeaderProps }) => (
                <TableContainer>
                  <Table zebra={false}>
                    <TableHead>
                      <TableRow>
                        {headers.map(header => (
                          <TableHeader {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(row => (
                        <TableRow
                          key={row.id}
                          onClick={() => {
                            this.props.history.push(`/${row.id}`)
                          }}
                        >
                          {row.cells.map(cell => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            />
          ) : (
            <DataTableSkeleton />
          )}
        </div>
      </div>
    )
  }
}

export default Buckets
