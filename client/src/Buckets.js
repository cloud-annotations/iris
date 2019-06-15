import React, { Component } from 'react'
import GoogleAnalytics from 'react-ga'
import {
  DataTable,
  DataTableSkeleton,
  Modal,
  TextInput,
  Loading,
  InlineLoading
} from 'carbon-components-react'
import { validateCookies, handleErrors } from './Utils'

import { connect } from 'react-redux'
import { loadBuckets } from './redux/buckets'

import MD5 from 'crypto-js/md5'
import Base64 from 'crypto-js/enc-base64'

import history from './history'

import 'carbon-components/css/carbon-components.min.css'
import './bx-overrides.css'
import styles from './Buckets.module.css'

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
const TOO_SHORT = 'Must be at least 3 characters.'
const NAME_EXISTS =
  'This bucket name already exists in IBM Cloud Object Storage. Create a new globally unique name.'
const EMPTY_NAME = 'Bucket name is required.'

const CreateBucket = ({ handleClick }) => {
  return (
    <div className={styles.createBucket} onClick={handleClick}>
      Create bucket
      <svg className={styles.createBucketIcon} viewBox="0 0 16 16">
        <path d="M7 7H4v2h3v3h2V9h3V7H9V4H7v3zm1 9A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
      </svg>
    </div>
  )
}

const DeleteIcon = () => (
  <svg className={styles.deleteIcon} width="12" height="16" viewBox="0 0 12 16">
    <path d="M11 4v11c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V4H0V3h12v1h-1zM2 4v11h8V4H2z" />
    <path d="M4 6h1v7H4zm3 0h1v7H7zM3 1V0h6v1z" />
  </svg>
)

const BucketTable = ({ buckets, loadingBuckets, promptDeleteBucket }) => {
  const headers = [
    { key: 'name', header: 'NAME' },
    { key: 'created', header: 'CREATED' }
  ]
  const handleRowClick = id => () => {
    history.push(`/${id}`)
  }
  const handleDeleteBucket = id => e => {
    promptDeleteBucket(e, id)
  }
  return (
    <>
      {buckets ? (
        <DataTable
          rows={buckets}
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
                    <TableHeader isSortable={false} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Draw each row */}
                  {rows.map(row => (
                    <TableRow key={row.id} onClick={handleRowClick(row.id)}>
                      {/* Draw each column in each row */}
                      {row.cells.map(cell => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      {/* Draw delete button column */}
                      <TableCell
                        className={styles.rowOverflow}
                        onClick={handleDeleteBucket(row.id)}
                      >
                        {loadingBuckets.includes(row.id) ? (
                          <InlineLoading success={false} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </TableCell>
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
    </>
  )
}

class Buckets extends Component {
  constructor(props) {
    super(props)
    this.initializeData()
    this.state = {
      modalOpen: false,
      textInputBucketName: '',
      invalidText: '',
      invalid: false,
      loading: false,
      loadingBuckets: []
    }
  }

  componentDidMount() {
    GoogleAnalytics.pageview('buckets')
  }

  initializeData = async () => {
    try {
      await validateCookies()
      this.props.dispatch(await loadBuckets())
    } catch (error) {
      console.log(error)
      if (error.message === 'Forbidden') {
        history.push('/login')
      }
    }
  }

  openModal = () => {
    this.setState({
      modalOpen: true
    })
  }

  closeModal = () => {
    this.setState({
      // create bucket
      modalOpen: false,
      loading: false,
      invalidText: '',
      textInputBucketName: '',
      invalid: false,
      // delete bucket
      modalDeleteBucket: false,
      bucketToDelete: null,
      textInputBucketToDelete: '',
      invalidTextBucketToDelete: null
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
        const url = `/api/proxy/${localStorage.getItem(
          'loginUrl'
        )}/${bucketName}`
        const options = {
          method: 'PUT',
          headers: {
            'ibm-service-instance-id': localStorage.getItem('resourceId')
          }
        }
        const request = new Request(url)
        fetch(request, options)
          .then(handleErrors)
          .then(() => {
            this.setState(
              {
                loading: false,
                invalidText: '',
                textInputBucketName: '',
                invalid: false
              },
              () => {
                this.closeModal()
                history.push(bucketName)
                this.initializeData()
              }
            )
          })
          .catch(error => {
            if (error.message === 'Forbidden') {
              history.push('/login')
            }
            if (error.message === 'Conflict') {
              this.setState({
                loading: false,
                invalidText: NAME_EXISTS,
                invalid: true
              })
            } else {
              this.setState({
                loading: false,
                invalidText: error.message,
                invalid: true
              })
            }
          })
      }
    )
  }

  onTextChangeBucketToDelete = e => {
    const bucketName = e.target.value
    this.setState({
      textInputBucketToDelete: bucketName
    })
  }

  promptDeleteBucket = (e, bucketName) => {
    e.stopPropagation()

    this.setState({
      bucketToDelete: bucketName,
      modalDeleteBucket: true
    })
  }

  checkDeleteBucket = () => {
    if (this.state.textInputBucketToDelete !== this.state.bucketToDelete) {
      this.setState({
        invalidTextBucketToDelete: 'Bucket names do not match.'
      })
    } else {
      this.deleteBucket(this.state.bucketToDelete)
      this.closeModal()
    }
  }

  deleteBucket = bucketName => {
    this.setState(prevState => {
      const loading = [...prevState.loadingBuckets, bucketName]
      return {
        loadingBuckets: loading
      }
    })

    const url = `/api/proxy/${localStorage.getItem('loginUrl')}/${bucketName}`
    const options = { method: 'GET' }
    const request = new Request(url)
    fetch(request, options)
      .then(handleErrors)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
      .then(data => {
        console.log(data)

        const elements = data.getElementsByTagName('Contents')
        const fileList = Array.prototype.map.call(elements, element => {
          return element.getElementsByTagName('Key')[0].innerHTML
        })

        if (fileList.length === 0) {
          return ''
        }

        const deleteXml = `<?xml version="1.0" encoding="UTF-8"?><Delete>${fileList
          .map(key => `<Object><Key>${key}</Key></Object>`)
          .join('')}</Delete>`

        return deleteXml
      })
      .then(xmlString => {
        // Skip emptying bucket and give ok respose.
        if (xmlString.length === 0) {
          return { ok: true }
        }

        const md5Hash = MD5(xmlString).toString(Base64)
        const url = `/api/proxy/${localStorage.getItem(
          'loginUrl'
        )}/${bucketName}?delete=`
        const options = {
          method: 'POST',
          body: xmlString,
          headers: {
            'Content-MD5': md5Hash
          }
        }
        const request = new Request(url)
        return fetch(request, options)
      })
      .then(handleErrors)
      .then(() => {
        const url = `/api/proxy/${localStorage.getItem(
          'loginUrl'
        )}/${bucketName}`
        const options = { method: 'DELETE' }
        const request = new Request(url)
        return fetch(request, options)
      })
      .then(handleErrors)
      .then(() => {
        return this.initializeData()
      })
      .then(() => {
        this.setState(prevState => {
          const loading = prevState.loadingBuckets.filter(bucket => {
            return bucketName !== bucket
          })
          return {
            loadingBuckets: loading
          }
        })
      })
      .catch(error => {
        console.error(error)
        if (error.message === 'Forbidden') {
          history.push('/login')
        }
        this.setState(prevState => {
          const loading = prevState.loadingBuckets.filter(bucket => {
            return bucketName !== bucket
          })
          return {
            loadingBuckets: loading
          }
        })
      })
  }

  render() {
    const { buckets } = this.props

    return (
      <div className={styles.wrapper}>
        {/* Delete Bucket Modal */}
        <Modal
          className="Buckets-Modal-TextInput-Wrapper"
          open={this.state.modalDeleteBucket}
          shouldSubmitOnEnter={true}
          danger={true}
          modalHeading="Are you absolutely sure?"
          primaryButtonText="Delete this bucket"
          secondaryButtonText="Cancel"
          onRequestClose={this.closeModal}
          onRequestSubmit={this.checkDeleteBucket}
          onSecondarySubmit={this.closeModal}
        >
          <p className="bx--modal-content__text">
            This action <strong>cannot</strong> be undone. This will permanently
            delete the bucket <strong>{this.state.bucketToDelete}</strong> and
            all of its contents.
          </p>
          <br />
          <p className="bx--modal-content__text">
            Please type in the name of the bucket to confirm.
          </p>
          <br />
          <TextInput
            className={styles.textInput}
            placeholder=""
            onChange={this.onTextChangeBucketToDelete}
            value={this.state.textInputBucketToDelete}
            invalidText={this.state.invalidTextBucketToDelete}
            invalid={this.state.invalidTextBucketToDelete}
            data-modal-primary-focus
          />
        </Modal>

        {/* Create Bucket Modal */}
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

        <div className={styles.table}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Buckets</div>
            <CreateBucket handleClick={this.openModal} />
          </div>
          <BucketTable
            buckets={buckets}
            loadingBuckets={this.state.loadingBuckets}
            promptDeleteBucket={this.promptDeleteBucket}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({ buckets: state.buckets })
export default connect(mapStateToProps)(Buckets)
