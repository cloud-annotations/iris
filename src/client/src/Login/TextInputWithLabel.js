import React from 'react'

import { TextInput } from 'carbon-components-react'

import styles from './Login.module.css'

const TextInputWithLabel = ({
  placeholder,
  name,
  value,
  type,
  autoComplete,
  onInputChanged,
  errorText,
  error
}) => {
  return (
    <div className={styles.formItem}>
      <label className={styles.label}>{placeholder}</label>
      <div className={styles.inputWrapper}>
        <TextInput
          className={error ? styles.errorInput : styles.input}
          placeholder={placeholder}
          autoComplete={autoComplete}
          name={name}
          value={value}
          type={type}
          onChange={onInputChanged}
          invalidText={errorText}
          invalid={error}
        />
        {error && (
          <svg
            className={styles.errorIcon}
            focusable="false"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path d="M8 1C4.2 1 1 4.2 1 8s3.2 7 7 7 7-3.1 7-7-3.1-7-7-7zm-.5 3h1v5h-1V4zm.5 8.2c-.4 0-.8-.4-.8-.8s.3-.8.8-.8c.4 0 .8.4.8.8s-.4.8-.8.8z" />
            <path
              d="M7.5 4h1v5h-1V4zm.5 8.2c-.4 0-.8-.4-.8-.8s.3-.8.8-.8c.4 0 .8.4.8.8s-.4.8-.8.8z"
              data-icon-path="inner-path"
              opacity="0"
            />
          </svg>
        )}
      </div>
    </div>
  )
}

export default TextInputWithLabel
