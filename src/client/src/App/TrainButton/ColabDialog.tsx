import React, { useEffect, useRef, useState } from 'react'

import { useSelector } from 'react-redux'

import { fullPublicEndpointForLocationConstraint } from 'endpoints'
import FloatingButton from '../FloatingButton'

import styles from './dialog.module.css'

interface Props {
  open: boolean
  onClose: () => any
}

function ColabDialog({ open, onClose }: Props) {
  const region = useSelector((state: any) => state.editor.location)
  const cosResources = useSelector((state: any) => state.resources.resources)
  const activeCOSResource = useSelector(
    (state: any) => state.resources.activeResource
  )
  const bucket = useSelector((state: any) => state.editor.bucket)
  const modelType = useSelector((state: any) => state.collection.type)

  const ref = useRef<HTMLElement>(null)

  const [copyText, setCopyText] = useState('Copy')
  const [credentials, setCredentials] = useState<string>()

  useEffect(() => {
    async function main() {
      // find or create a binding.
      const cosResourceInfo = cosResources.find(
        (r: any) => r.id === activeCOSResource
      )

      if (cosResourceInfo === undefined) {
        return
      }

      const credentialsEndpoint =
        '/api/proxy/resource-controller.cloud.ibm.com/v2/resource_keys'
      const listCredentialsEndpoint = `${credentialsEndpoint}?name=cloud-annotations-binding&source_crn=${cosResourceInfo.crn}`
      const credentialsList = await fetch(listCredentialsEndpoint).then((res) =>
        res.json()
      )

      let creds
      // create binding if none exists.
      if (credentialsList.resources.length > 0) {
        creds = credentialsList.resources[0]
      } else {
        const resCreate = await fetch(credentialsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'cloud-annotations-binding',
            source: cosResourceInfo.guid,
            role: 'writer',
            parameters: {
              HMAC: true,
            },
          }),
        }).then((res) => res.json())
        creds = resCreate
      }

      const {
        access_key_id,
        secret_access_key,
      } = creds.credentials.cos_hmac_keys

      const credentials = {
        bucket: bucket,
        access_key_id: access_key_id,
        secret_access_key: secret_access_key,
        endpoint_url: fullPublicEndpointForLocationConstraint(region),
      }

      setCredentials(JSON.stringify(credentials, null, 2))
    }

    main()
  }, [activeCOSResource, bucket, cosResources, region])

  const handleCurlCopy = () => {
    setCopyText('Copied')
    setTimeout(() => {
      setCopyText('Copy')
    }, 2000)
    navigator.clipboard.writeText(ref.current?.innerText ?? '')
  }

  let notebookUrl
  switch (modelType) {
    case 'classification':
      notebookUrl =
        'https://colab.research.google.com/github/cloud-annotations/google-colab-training/blob/master/classification.ipynb'
      break
    case 'localization':
      notebookUrl =
        'https://colab.research.google.com/github/cloud-annotations/google-colab-training/blob/master/object_detection.ipynb'
      break
  }

  return (
    <div className={open ? styles.popupWrapper : styles.popupWrapperHidden}>
      <div className={styles.popup}>
        <div className={styles.contentWrapper}>
          <div className={styles.popupTitle}>Connecting your bucket</div>
          <div className={styles.popupBody}>
            Use the following credentials to connect this bucket to Google
            Colab. Your images and annotations can then be used to train your
            very own model.
          </div>
        </div>
        <div style={{ margin: '16px 16px 48px 16px' }}>
          <FloatingButton onClick={handleCurlCopy} label={copyText}>
            <pre
              style={{
                paddingRight: '60px',
              }}
            >
              <code ref={ref}>
                {credentials === undefined
                  ? 'loading...'
                  : 'credentials = ' + credentials}
              </code>
            </pre>
          </FloatingButton>
        </div>
        <div className={styles.popupButtons}>
          <div
            className={styles.popupButtonSecondary}
            onClick={() => {
              onClose()
            }}
          >
            Cancel
          </div>
          <a
            href={`${notebookUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={
              cosResources.length > 0
                ? styles.popupButtonPrimary
                : styles.popupButtonPrimaryDissabled
            }
          >
            Open Colab
          </a>
        </div>
      </div>
    </div>
  )
}

export default ColabDialog
