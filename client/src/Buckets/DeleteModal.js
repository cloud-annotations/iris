import React from 'react'
import MD5 from 'crypto-js/md5'
import Base64 from 'crypto-js/enc-base64'
import { Modal, TextInput } from 'carbon-components-react'

import { handleErrors } from 'Utils'

const DeleteModal = () => {
  // onTextChangeBucketToDelete = e => {
  //   const bucketName = e.target.value
  //   this.setState({
  //     textInputBucketToDelete: bucketName
  //   })
  // }
  // promptDeleteBucket = (e, bucketName) => {
  //   e.stopPropagation()
  //   this.setState({
  //     bucketToDelete: bucketName,
  //     modalDeleteBucket: true
  //   })
  // }
  // checkDeleteBucket = () => {
  //   if (this.state.textInputBucketToDelete !== this.state.bucketToDelete) {
  //     this.setState({
  //       invalidTextBucketToDelete: 'Bucket names do not match.'
  //     })
  //   } else {
  //     this.deleteBucket(this.state.bucketToDelete)
  //     this.closeModal()
  //   }
  // }
  // deleteBucket = bucketName => {
  //   this.setState(prevState => {
  //     const loading = [...prevState.loadingBuckets, bucketName]
  //     return {
  //       loadingBuckets: loading
  //     }
  //   })
  //   const url = `/api/proxy/${localStorage.getItem('loginUrl')}/${bucketName}`
  //   const options = { method: 'GET' }
  //   const request = new Request(url)
  //   fetch(request, options)
  //     .then(handleErrors)
  //     .then(response => response.text())
  //     .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
  //     .then(data => {
  //       console.log(data)
  //       const elements = data.getElementsByTagName('Contents')
  //       const fileList = Array.prototype.map.call(elements, element => {
  //         return element.getElementsByTagName('Key')[0].innerHTML
  //       })
  //       if (fileList.length === 0) {
  //         return ''
  //       }
  //       const deleteXml = `<?xml version="1.0" encoding="UTF-8"?><Delete>${fileList
  //         .map(key => `<Object><Key>${key}</Key></Object>`)
  //         .join('')}</Delete>`
  //       return deleteXml
  //     })
  //     .then(xmlString => {
  //       // Skip emptying bucket and give ok respose.
  //       if (xmlString.length === 0) {
  //         return { ok: true }
  //       }
  //       const md5Hash = MD5(xmlString).toString(Base64)
  //       const url = `/api/proxy/${localStorage.getItem(
  //         'loginUrl'
  //       )}/${bucketName}?delete=`
  //       const options = {
  //         method: 'POST',
  //         body: xmlString,
  //         headers: {
  //           'Content-MD5': md5Hash
  //         }
  //       }
  //       const request = new Request(url)
  //       return fetch(request, options)
  //     })
  //     .then(handleErrors)
  //     .then(() => {
  //       const url = `/api/proxy/${localStorage.getItem(
  //         'loginUrl'
  //       )}/${bucketName}`
  //       const options = { method: 'DELETE' }
  //       const request = new Request(url)
  //       return fetch(request, options)
  //     })
  //     .then(handleErrors)
  //     .then(() => {
  //       return this.initializeData()
  //     })
  //     .then(() => {
  //       this.setState(prevState => {
  //         const loading = prevState.loadingBuckets.filter(bucket => {
  //           return bucketName !== bucket
  //         })
  //         return {
  //           loadingBuckets: loading
  //         }
  //       })
  //     })
  //     .catch(error => {
  //       console.error(error)
  //       if (error.message === 'Forbidden') {
  //         history.push('/login')
  //       }
  //       this.setState(prevState => {
  //         const loading = prevState.loadingBuckets.filter(bucket => {
  //           return bucketName !== bucket
  //         })
  //         return {
  //           loadingBuckets: loading
  //         }
  //       })
  //     })
  // }
  // return (
  //   <Modal
  //     open={isOpen}
  //     modalHeading="Are you absolutely sure?"
  //     primaryButtonText="Delete this bucket"
  //     secondaryButtonText="Cancel"
  //     onRequestSubmit={this.checkDeleteBucket}
  //     onRequestClose={onClose}
  //     onSecondarySubmit={onSubmit}
  //     shouldSubmitOnEnter
  //     danger
  //   >
  //     <p className="bx--modal-content__text">
  //       This action <strong>cannot</strong> be undone. This will permanently
  //       delete the bucket <strong>{itemToDelete}</strong> and all of its
  //       contents.
  //     </p>
  //     <br />
  //     <p className="bx--modal-content__text">
  //       Please type in the name of the bucket to confirm.
  //     </p>
  //     <br />
  //     <TextInput
  //       className={styles.textInput}
  //       placeholder=""
  //       onChange={this.onTextChangeBucketToDelete}
  //       value={this.state.textInputBucketToDelete}
  //       invalidText={this.state.invalidTextBucketToDelete}
  //       invalid={this.state.invalidTextBucketToDelete}
  //       data-modal-primary-focus
  //     />
  //   </Modal>
  // )
}

export default DeleteModal
