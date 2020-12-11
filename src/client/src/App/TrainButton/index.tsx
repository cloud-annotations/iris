import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ColabDialog from './ColabDialog'

import styles from './styles.module.css'
import WMLDialog from './WMLDialog'

const trainingOptionsMap = {
  localization: [
    {
      id: 'colab',
      displayName: 'Train in Colab',
      dialog: ColabDialog,
    },
  ],
  classification: [
    {
      id: 'wml',
      displayName: 'Train with Watson Machine Learning',
      dialog: WMLDialog,
    },
    {
      id: 'colab',
      displayName: 'Train in Colab',
      dialog: ColabDialog,
    },
  ],
}

function TrainButton() {
  const [open, setOpen] = useState(false)

  const [showTrainingOptions, setShowTrainingOptions] = useState(false)

  const modelType = useSelector((state: any) => state.collection.type) as
    | 'classification'
    | 'localization'

  const [active, setActive] = useState<{
    id: string
    displayName: string
    dialog: any
  }>()

  const trainingOptions = trainingOptionsMap[modelType]

  useEffect(() => {
    if (trainingOptions?.length > 0) {
      setActive(trainingOptions[0])
    }
  }, [trainingOptions])

  if (active === undefined) {
    return null
  }

  return (
    <React.Fragment>
      <div className={styles.train}>
        <button
          className={styles.button}
          onClick={() => {
            setOpen(true)
          }}
        >
          {active.displayName}
        </button>

        <button
          className={styles.caret}
          onClick={() => {
            setShowTrainingOptions(!showTrainingOptions)
          }}
        >
          <div className={styles.border} />
          <svg
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            name="chevron--down"
            aria-label="Open menu"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            role="img"
          >
            <path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path>
            <title>Open menu</title>
          </svg>
        </button>
        {showTrainingOptions && (
          <div className={styles.dropdown}>
            {trainingOptions.map((o) => (
              <div
                className={styles.dropdownItem}
                onClick={() => {
                  setShowTrainingOptions(false)
                  setActive(o)
                  setOpen(true)
                }}
              >
                <div className={styles.dropdownItemText}>{o.displayName}</div>
                {o.id === active.id ? (
                  <svg
                    focusable="false"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    width="16"
                    height="16"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                    style={{ marginLeft: 'auto' }}
                  >
                    <path d="M13 24L4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"></path>
                  </svg>
                ) : (
                  <div
                    style={{
                      marginLeft: 'auto',
                      width: '16px',
                      height: '16px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <active.dialog
        open={open}
        onClose={() => {
          setOpen(false)
        }}
      />
    </React.Fragment>
  )
}

export default TrainButton
