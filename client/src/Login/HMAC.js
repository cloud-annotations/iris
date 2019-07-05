import React from 'react'

import {
  Select,
  SelectItemGroup,
  SelectItem,
  TextInput
} from 'carbon-components-react'

import { endpoints, regions } from 'endpoints'
import TextInputWithLabel from './TextInputWithLabel'

import styles from './Login.module.css'

const HMAC = ({
  accessKeyId,
  secretAccessKey,
  endpoint,
  isCustomEndpoint,
  onToggleCustomEndpoint,
  onInputChanged
}) => {
  const defaultRegion = Object.keys(endpoints).find(
    key => endpoints[key] === endpoint.value
  )

  return (
    <>
      <TextInputWithLabel
        placeholder="Access Key ID"
        name="accessKeyId"
        value={accessKeyId.value}
        type="text"
        autoComplete="off"
        onInputChanged={onInputChanged}
        errorText="Invalid access key id."
        error={accessKeyId.error}
      />
      <div className={styles.formItem}>
        <label className={styles.label}>
          {isCustomEndpoint ? 'Endpoint' : 'Region'}
          <span className={styles.fakeLink} onClick={onToggleCustomEndpoint}>
            {isCustomEndpoint
              ? 'switch to region'
              : 'switch to custom endpoint'}
          </span>
        </label>
        <>
          {isCustomEndpoint ? (
            <TextInput
              className={styles.input}
              placeholder="Endpoint"
              autoComplete="off"
              name="endpoint"
              value={endpoint.value}
              type="text"
              onChange={onInputChanged}
            />
          ) : (
            <Select
              className={styles.select}
              hideLabel
              name="endpoint"
              onChange={onInputChanged}
              id="select-1"
              defaultValue={defaultRegion}
            >
              {Object.keys(regions).map(group => {
                return (
                  <SelectItemGroup label={group}>
                    {regions[group].map(url => (
                      <SelectItem value={url} text={url} />
                    ))}
                  </SelectItemGroup>
                )
              })}
            </Select>
          )}
        </>
      </div>
      <TextInputWithLabel
        placeholder="Secret Access Key"
        name="secretAccessKey"
        value={secretAccessKey.value}
        type="password"
        autoComplete="new-password"
        onInputChanged={onInputChanged}
        errorText="Invalid secret access key."
        error={secretAccessKey.error}
      />
      <a href="/login">Log in with IAM credentials</a>
    </>
  )
}

export default HMAC
