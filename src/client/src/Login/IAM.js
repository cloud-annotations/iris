import React from 'react'

import { Select, SelectItemGroup, SelectItem } from 'carbon-components-react'

import { endpoints, regions } from 'endpoints'
import TextInputWithLabel from './TextInputWithLabel'

import styles from './Login.module.css'

const IAM = ({ resourceId, apiKey, endpoint, onInputChanged }) => {
  const defaultRegion = Object.keys(endpoints).find(
    key => endpoints[key] === endpoint.value
  )

  return (
    <>
      <TextInputWithLabel
        placeholder="Resource Instance ID"
        name="resourceId"
        value={resourceId.value}
        type="text"
        autoComplete="off"
        onInputChanged={onInputChanged}
        errorText="Invalid resource instance id."
        error={resourceId.error}
      />
      <div className={styles.formItem}>
        <label className={styles.label}>Region</label>
        <Select
          className={styles.select}
          name="endpoint"
          hideLabel
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
      </div>
      <TextInputWithLabel
        placeholder="API Key"
        name="apiKey"
        value={apiKey.value}
        type="password"
        autoComplete="new-password"
        onInputChanged={onInputChanged}
        errorText="Invalid api key."
        error={apiKey.error}
      />
      <a href="/login?hmac">Log in with HMAC credentials</a>
    </>
  )
}

export default IAM
