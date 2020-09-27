import React, { useState, useCallback } from 'react'
import { Modal, TextInput } from 'carbon-components-react'

import styles from './Buckets.module.css'

// Error Messages.
const DOES_NOT_MATCH = 'Bucket names do not match.'

const DeleteModal = ({ isOpen, onClose, onSubmit, itemToDelete }) => {
  const [textInputValue, setTextInputValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleTextInputChange = useCallback(({ target: { value } }) => {
    setTextInputValue(value)
  }, [])

  const handleSubmit = useCallback(() => {
    if (textInputValue !== itemToDelete) {
      setErrorMessage(DOES_NOT_MATCH)
    } else {
      setErrorMessage('')
      setTextInputValue('')
      onSubmit(itemToDelete)
    }
  }, [itemToDelete, onSubmit, textInputValue])

  const handleClose = useCallback(() => {
    setErrorMessage('')
    setTextInputValue('')
    onClose()
  }, [onClose])

  return (
    <Modal
      open={isOpen}
      modalHeading="Are you absolutely sure?"
      primaryButtonText="Delete this bucket"
      secondaryButtonText="Cancel"
      onRequestSubmit={handleSubmit}
      onRequestClose={handleClose}
      onSecondarySubmit={handleClose}
      shouldSubmitOnEnter
      danger
    >
      <p className="bx--modal-content__text">
        This action <strong>cannot</strong> be undone. This will permanently
        delete the bucket <strong>{itemToDelete}</strong> and all of its
        contents.
      </p>
      <br />
      <p className="bx--modal-content__text">
        Please type in the name of the bucket to confirm.
      </p>
      <br />
      <TextInput
        className={styles.textInput}
        placeholder=""
        onChange={handleTextInputChange}
        value={textInputValue}
        invalidText={errorMessage}
        invalid={errorMessage !== ''}
        data-modal-primary-focus
      />
    </Modal>
  )
}

export default DeleteModal
