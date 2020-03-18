import React, { useState, useCallback } from 'react'
import { Modal } from 'carbon-components-react'

import CardChoice from './CardChoice'

import styles from './ChooseBucketModal.module.css'
import classification from './classification.png'
import localization from './localization.png'

const Type = {
  CLASSIFICATION: 'classification',
  LOCALIZATION: 'localization'
}

const ChooseBucketModal = ({ isOpen, onClose, onSubmit }) => {
  const [choice, setChoice] = useState(Type.CLASSIFICATION)
  const handleChoice = useCallback(
    choice => () => {
      setChoice(choice)
    },
    []
  )
  const handleSubmit = useCallback(() => {
    onSubmit(choice)
  }, [choice, onSubmit])
  return (
    <Modal
      className="Buckets-Modal-TextInput-Wrapper"
      open={isOpen}
      shouldSubmitOnEnter={true}
      modalHeading="Annotation type"
      primaryButtonText="Confirm"
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onRequestSubmit={handleSubmit}
      onSecondarySubmit={onClose}
    >
      <div className={styles.choiceWrapper}>
        <CardChoice
          onClick={handleChoice(Type.CLASSIFICATION)}
          selected={choice === Type.CLASSIFICATION}
          title="Classification"
          image={classification}
        />
        <CardChoice
          onClick={handleChoice(Type.LOCALIZATION)}
          selected={choice === Type.LOCALIZATION}
          title="Localization"
          image={localization}
        />
      </div>
    </Modal>
  )
}

export default ChooseBucketModal
