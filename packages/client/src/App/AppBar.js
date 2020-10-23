import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'
import { connect } from 'react-redux'
import Toggle from 'react-toggle'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Loading } from 'carbon-components-react'

import 'react-toggle/style.css'
import './react-toggle-overrides.css'

import { ProfileDropDown } from 'common/DropDown/DropDown'
import history from 'globalHistory'
import {
  uploadImages,
  syncAction,
  deleteImages,
  createLabel,
  labelImages,
  addModel,
  bootstrap,
} from 'redux/collection'
import { incrementSaving, decrementSaving } from 'redux/editor'

import moon from './moon.png'
import styles from './AppBar.module.css'
import useOnClickOutside from 'hooks/useOnClickOutside'
import { getDataTransferItems, convertToJpeg, videoToJpegs } from 'Utils'
import { setActiveImage } from 'redux/editor'
import COS from 'api/COSv2'
import {
  fullPrivateEndpointForLocationConstraint,
  fullPublicEndpointForLocationConstraint,
  endpointForLocationConstraint,
} from 'endpoints'
import { setActiveWMLResource } from 'redux/wmlResources'

import { importDataset } from 'dataset-utils'
import FloatingButton from './FloatingButton'

const DEFAULT_GPU = 'k80'
const DEFAULT_STEPS = '500'
const DEFAULT_TRAINING_DEFINITION = {
  framework: {
    name: 'tensorflow',
    version: '1.15',
    runtimes: [
      {
        name: 'python',
        version: '3.6',
      },
    ],
  },
}

const generateFiles = async (images, videos) => {
  const imageFiles = images.map(
    async (image) =>
      await convertToJpeg(image, {
        maxHeight: window.MAX_IMAGE_HEIGHT,
        maxWidth: window.MAX_IMAGE_WIDTH,
        mode: window.IMAGE_SCALE_MODE,
      })
  )
  const videoFiles = videos.map(
    async (video) =>
      await videoToJpegs(video, {
        fps: window.FPS,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        maxWidth: window.MAX_IMAGE_WIDTH,
        mode: window.IMAGE_SCALE_MODE,
      })
  )
  return (await Promise.all([...imageFiles, ...videoFiles])).flat()
}

const zipImages = async (
  endpoint,
  bucket,
  collection,
  folder,
  setFilesZipped
) => {
  const labeledImageNames = Object.keys(collection.annotations)
  return await Promise.all(
    labeledImageNames.map(async (name) => {
      try {
        const imgData = await new COS({ endpoint: endpoint }).getObject({
          Bucket: bucket,
          Key: name,
        })
        folder.file(name, imgData, { binary: true })

        const image = new Image()
        image.src = URL.createObjectURL(imgData)
        return await new Promise((resolve) => {
          image.onload = () => {
            if (setFilesZipped) {
              setFilesZipped((zipped) => (zipped += 1))
            }

            resolve({
              name: name,
              dimensions: { width: image.width, height: image.height },
            })
          }
        })
      } catch {
        return await new Promise((resolve) => {
          console.error(`failed to download: skipping ${name}`)
          if (setFilesZipped) {
            setFilesZipped((zipped) => (zipped += 1))
          }

          resolve({
            name: name,
            dimensions: { width: 0, height: 0 },
          })
        })
      }
    })
  )
}

const MINIMUM_EXAMPLE_COUNT = 20

const PoopUp2 = connect((state) => ({
  cosResources: state.resources.resources,
  resources: state.wmlResources.resources,
  activeResource: state.wmlResources.activeResource,
  collection: state.collection,
}))(
  ({
    cosResources,
    // resources,
    // activeResource,
    show,
    onPrimary,
    onSecondary,
    collection,
  }) => {
    const [spaces, setSpaces] = useState([])
    const [chosenSpaceID, setChosenSpaceID] = useState(undefined)

    useEffect(() => {
      fetch('/api/proxy/api.dataplatform.cloud.ibm.com/v2/spaces')
        .then((r) => r.json())
        .then((j) => {
          const { resources } = j
          const [firstResource] = resources
          setSpaces(resources)
          setChosenSpaceID(firstResource.metadata.id)
        })
    }, [])

    const handlePrimary = useCallback(() => {
      const resourceInfo = spaces.find((r) => r.metadata.id === chosenSpaceID)
      onPrimary(resourceInfo)
    }, [chosenSpaceID, onPrimary, spaces])

    const handSelectChange = useCallback((e) => {
      setChosenSpaceID(e.target.value)
    }, [])

    const enoughImages = Object.values(collection.getLabelMapCount()).reduce(
      (acc, count) => acc && count > MINIMUM_EXAMPLE_COUNT,
      true
    )

    return (
      <div className={show ? styles.popupWrapper : styles.popupWrapperHidden}>
        <div className={styles.popup}>
          <div className={styles.contentWrapper}>
            <div className={styles.popupTitle}>Start a training run</div>
            <div className={styles.popupBody}>
              Training will temporarily connect this bucket to your Watson
              Studio deployment space. Your images and annotations will be used
              to create your own personal object detection model.
            </div>

            {!enoughImages && (
              <div className={styles.popupWarning}>
                <svg
                  focusable="false"
                  preserveAspectRatio="xMidYMid meet"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M10,1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S15,1,10,1z M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1	s1,0.4,1,1S10.6,16,10,16z"></path>
                  <path
                    d="M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S10.6,16,10,16z"
                    data-icon-path="inner-path"
                    opacity="0"
                  ></path>
                  <title>warning icon</title>
                </svg>
                <div className={styles.popupWarningBody}>
                  <div className={styles.popupWarningTitle}>
                    Not enough examples per label
                  </div>
                  <div>
                    Issues with training can occur when a label doesn't have at
                    least <strong>{MINIMUM_EXAMPLE_COUNT}</strong> examples.
                  </div>
                </div>
              </div>
            )}

            <div className={styles.popupFormItem}>
              <div className={styles.popupSelectLabelWrapper}>
                <label for="wml-select" className={styles.popupSelectLabel}>
                  Watson Studio deployment space
                </label>
                <div className={styles.popupSelectWrapper}>
                  <select
                    className={styles.popupSelect}
                    id="wml-select"
                    onChange={handSelectChange}
                  >
                    {spaces.map((r) => (
                      <option value={r.metadata.id}>{r.entity.name}</option>
                    ))}
                  </select>
                  <svg
                    className={styles.popupSelectIcon}
                    focusable="false"
                    preserveAspectRatio="xMidYMid meet"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.popupButtons}>
            <div className={styles.popupButtonSecondary} onClick={onSecondary}>
              Cancel
            </div>
            <div
              className={
                cosResources.length > 0 && spaces.length > 0
                  ? styles.popupButtonPrimary
                  : styles.popupButtonPrimaryDissabled
              }
              onClick={handlePrimary}
            >
              Train
            </div>
          </div>
        </div>
      </div>
    )
  }
)

const PoopUp = connect((state) => ({
  cosResources: state.resources.resources,
  activeCOSResource: state.resources.activeResource,
  bucket: state.editor.bucket,
  modelType: state.collection.type,
}))(
  ({
    location,
    modelType,
    bucket,
    cosResources,
    activeCOSResource,
    show,
    onSecondary,
  }) => {
    const ref = useRef(null)

    const [copyText, setCopyText] = useState('Copy')
    const [credentials, setCredentials] = useState(undefined)

    useEffect(() => {
      async function main() {
        // find or create a binding.
        const cosResourceInfo = cosResources.find(
          (r) => r.id === activeCOSResource
        )
        const credentialsEndpoint =
          '/api/proxy/resource-controller.cloud.ibm.com/v2/resource_keys'
        const listCredentialsEndpoint = `${credentialsEndpoint}?name=cloud-annotations-binding&source_crn=${cosResourceInfo.crn}`
        const credentialsList = await fetch(
          listCredentialsEndpoint
        ).then((res) => res.json())

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
          endpoint_url: fullPublicEndpointForLocationConstraint(location),
        }

        setCredentials(JSON.stringify(credentials, null, 2))
      }

      main()
    }, [])

    const handleCurlCopy = () => {
      setCopyText('Copied')
      setTimeout(() => {
        setCopyText('Copy')
      }, 2000)
      navigator.clipboard.writeText(ref.current.innerText)
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
      <div className={show ? styles.popupWrapper : styles.popupWrapperHidden}>
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
            <div className={styles.popupButtonSecondary} onClick={onSecondary}>
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
)

const Downloader = ({ current, total }) => {
  const amount = Number.parseInt((1 - current / total) * 169, 10)
  return (
    <div className={total === 0 ? styles.downloaderHidden : styles.downloader}>
      <div className={styles.downloaderContentWrapper}>
        <svg
          style={{
            width: '20px',
            height: '20px',
            fill: 'transparent',
            margin: '0 16px',
            transform: 'rotate(-90deg)',
          }}
          viewBox="-29.8125 -29.8125 59.625 59.625"
        >
          <circle
            style={{
              strokeWidth: 6,
              stroke: '#e0e0e0',
              strokeDashoffset: 0,
              strokeLinecap: 'butt',
              strokeDasharray: 169,
            }}
            cx="0"
            cy="0"
            r="26.8125"
          ></circle>
          <circle
            style={{
              strokeWidth: 6,
              stroke: '#0f62fe',
              strokeDashoffset: amount,
              strokeLinecap: 'butt',
              strokeDasharray: 169,
            }}
            cx="0"
            cy="0"
            r="26.8125"
          ></circle>
        </svg>
        <div
          className={styles.downloaderText}
        >{`Zipping ${current.toLocaleString('en')}/${total.toLocaleString(
          'en'
        )} files`}</div>
      </div>
    </div>
  )
}

const getOrCreateBinding = async (cosResources, activeCOSResource) => {
  // find or create a binding.
  const cosResourceInfo = cosResources.find((r) => r.id === activeCOSResource)
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
  return creds.credentials
}

const AppBar = ({
  bucket,
  location,
  profile,
  saving,
  syncAction,
  imageRange,
  setActiveImage,
  collection,
  incrementSaving,
  decrementSaving,
  addModel,
  cosResources,
  activeCOSResource,
  wmlResourcesLoading,
  wmlResources,
  sandbox,
  dissabled,
  setActiveWMLResource,
  bootstrap,
}) => {
  const optionsRef = useRef(undefined)
  const mediaInputRef = useRef(undefined)
  const modelInputRef = useRef(undefined)
  const importInputRef = useRef(undefined)

  const [filesZipped, setFilesZipped] = useState(0)
  const [filesToZip, setFilesToZip] = useState(0)

  const [preparingToTrain, setPreparingToTrain] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [showWMLModal, setShowWMLModal] = useState(false)

  const [optionsOpen, setOptionsOpen] = useState(false)
  const [lastHoveredOption, setLastHoveredOption] = useState(undefined)
  const [lastHoveredSubOption, setLastHoveredSubOption] = useState(undefined)
  const [darkModeToggle, setDarkModeToggle] = useState(
    document.body.className === 'dark'
  )

  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          setDarkModeToggle(document.body.className === 'dark')
        }
      }
    })
    observer.observe(document.body, { attributes: true })
    return () => {
      observer.disconnect()
    }
  }, [])

  const handleToggleDarkMode = useCallback((e) => {
    e.target.blur() // give up focus so other inputs work properly.
    setDarkModeToggle((mode) => {
      const nextMode = !mode
      localStorage.setItem('darkMode', nextMode)
      document.body.className = nextMode ? 'dark' : 'light'
      return nextMode
    })
  }, [])

  const handleClick = useCallback(() => {
    history.push('/')
  }, [])

  const handleOptionClick = useCallback(() => {
    setOptionsOpen(true)
  }, [])

  const handleClickOutside = useCallback(() => {
    setLastHoveredSubOption(undefined)
    setOptionsOpen(false)
  }, [])

  const handleOptionHover = useCallback((e) => {
    setLastHoveredOption(e.currentTarget.id)
  }, [])

  const handleSubOptionHover = useCallback((e) => {
    setLastHoveredSubOption(e.currentTarget.id)
  }, [])

  const handleClickTrain = useCallback(() => {
    setShowModal(true)
  }, [])

  const handleClickTrainWMLV4 = useCallback(() => {
    setShowWMLModal(true)
  }, [])

  const handleTrainModalPrimary = useCallback(() => {}, [])

  const handleTrainWMLModalPrimary = useCallback(
    async (space) => {
      // setActiveWMLResource(instance.id)
      setPreparingToTrain(true)
      setShowWMLModal(false)
      // find or create a binding.
      const cosResourceInfo = cosResources.find(
        (r) => r.id === activeCOSResource
      )
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

      const spaceID = space.metadata.id
      // Try to find the start command (could be `start.sh` or `zipname/start.sh`)
      const command = `cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh ${DEFAULT_STEPS}`

      // TODO: how can we infer WML endpoint?
      const resTrainingDefinition = await fetch(
        `/api/proxy/us-south.ml.cloud.ibm.com/ml/v4/model_definitions?space_id=${spaceID}&version=2020-09-01`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: bucket,
            space_id: spaceID,
            description: bucket,
            version: '2.0',
            platform: { name: 'python', versions: ['3.6'] },
            command: command,
          }),
        }
      ).then((res) => res.json())

      console.log(resTrainingDefinition)

      await fetch(
        `/api/proxy/us-south.ml.cloud.ibm.com/ml/v4/model_definitions/${resTrainingDefinition.metadata.id}/model?space_id=${spaceID}&version=2020-09-01`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: await fetch(
            '/api/proxy/github.com/cloud-annotations/training/releases/latest/download/training.zip'
          ).then((res) => res.blob()),
        }
      )

      const connection = {
        endpoint_url: fullPrivateEndpointForLocationConstraint(location),
        access_key_id: access_key_id,
        secret_access_key: secret_access_key,
      }

      const trainingRun = {
        training_data_references: [
          {
            name: 'training_input_data',
            type: 's3',
            connection: connection,
            location: { bucket: bucket },
          },
        ],
        results_reference: {
          name: 'training_results',
          connection: connection,
          location: { bucket: bucket },
          type: 's3',
        },
        name: bucket,
        description: bucket,
        model_definition: {
          id: resTrainingDefinition.metadata.id,
          command: command,
          hardware_spec: { name: 'K80', nodes: 1 },
          software_spec: { name: 'tensorflow_1.15-py3.6' },
          parameters: {
            name: bucket,
            description: bucket,
          },
        },
        space_id: spaceID,
      }

      const resTrainingRun = await fetch(
        `/api/proxy/us-south.ml.cloud.ibm.com/ml/v4/trainings?version=2020-09-01`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trainingRun),
        }
      ).then((res) => res.json())

      console.log(resTrainingRun)

      setPreparingToTrain(false)

      // history.push(`/training?model=${resTrainingRun.metadata.guid}`)
    },
    [activeCOSResource, bucket, cosResources, location, setActiveWMLResource]
  )

  const handleTrainWMLModalSecondary = useCallback(() => {
    setShowWMLModal(false)
  }, [])

  const handleTrainModalSecondary = useCallback(() => {
    setShowModal(false)
  }, [])

  useOnClickOutside(optionsRef, handleClickOutside, true)

  const handleMediaChosen = useCallback(
    async (e) => {
      e.stopPropagation()
      const fileList = getDataTransferItems(e)
      const images = fileList.filter((file) => file.type.startsWith('image/'))
      const videos = fileList.filter((file) => file.type.startsWith('video/'))
      const files = await generateFiles(images, videos)
      syncAction(uploadImages, [files])
      mediaInputRef.current.value = null
      mediaInputRef.current.blur()
      setOptionsOpen(false)
    },
    [syncAction]
  )

  const handleModelChosen = useCallback(
    async (e) => {
      e.stopPropagation()
      incrementSaving()

      const fileList = getDataTransferItems(e)
      const [zipFile] = fileList.filter((file) =>
        file.name.toLowerCase().endsWith('.zip')
      )

      JSZip.loadAsync(zipFile).then((zip) => {
        const modelFile = '/model.json'
        let basePath
        zip.forEach((relativePath) => {
          if (relativePath.toLowerCase().endsWith(modelFile)) {
            basePath = relativePath.substring(
              0,
              relativePath.length - modelFile.length
            )
          }
        })
        if (basePath !== undefined) {
          let promises = []
          zip.forEach((relativePath, zipEntry) => {
            if (relativePath.startsWith(basePath)) {
              const fileName = relativePath.substring(
                basePath.length,
                relativePath.length
              )
              if (fileName !== '/') {
                console.log(`model_web${fileName}`)
                const uploadPromise = zipEntry.async('blob').then((blob) =>
                  collection.cos.putObject({
                    Bucket: collection.bucket,
                    Key: `model_web${fileName}`,
                    Body: blob,
                  })
                )
                promises = [...promises, uploadPromise]
              }
            }
          })
          Promise.all(promises).then(() => {
            addModel('model_web')
            decrementSaving()
          })
        }
      })

      modelInputRef.current.value = null
      modelInputRef.current.blur()
      setOptionsOpen(false)
    },
    [
      addModel,
      collection.bucket,
      collection.cos,
      decrementSaving,
      incrementSaving,
    ]
  )

  const handleDeleteImage = useCallback(
    (e) => {
      e.stopPropagation()
      syncAction(deleteImages, [imageRange])
      setActiveImage(undefined)
      setOptionsOpen(false)
    },
    [imageRange, syncAction, setActiveImage]
  )

  const handleExportNotebook = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      const credentials = await getOrCreateBinding(
        cosResources,
        activeCOSResource
      )

      const classificationNotebook = await fetch(
        '/api/proxy/github.com/cloud-annotations/notebooks/raw/master/classification-notebook.ipynb'
      ).then((r) => r.json())

      const newCells = classificationNotebook.cells.map((cell) => {
        const newSource = cell.source.map((s) =>
          s
            .replace('$$$BUCKET$$$', bucket)
            .replace('$$$IBM_API_KEY_ID$$$', credentials.apikey)
            .replace('$$$IAM_SERVICE_ID$$$', credentials.resource_instance_id)
            .replace(
              '$$$ENDPOINT$$$',
              fullPublicEndpointForLocationConstraint(location)
            )
        )
        return { ...cell, source: newSource }
      })

      const blob = new Blob(
        [
          JSON.stringify(
            { ...classificationNotebook, cells: newCells },
            null,
            1
          ),
        ],
        {
          type: 'application/json',
        }
      )
      saveAs(blob, 'cloud-annotations-training.ipynb')
    },
    [cosResources, activeCOSResource, bucket, location]
  )

  const handleExportZip = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the annotations.json
      setFilesToZip(Object.keys(collection.annotations).length + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )

      folder.file('_annotations.json', JSON.stringify(collection.toJSON()))

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleExportYOLO = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the annotations.json
      setFilesToZip(Object.keys(collection.annotations).length + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )

      images.forEach(({ name }) => {
        const annotationTxt = collection.annotations[name]
          .map((annotation) => {
            const labelIndex = collection.labels.indexOf(annotation.label)
            const width = (annotation.x2 - annotation.x).toFixed(6)
            const height = (annotation.y2 - annotation.y).toFixed(6)
            const midX = (annotation.x + width / 2).toFixed(6)
            const midY = (annotation.y + height / 2).toFixed(6)
            return `${labelIndex} ${midX} ${midY} ${width} ${height}`
          })
          .join('\n')
        folder.file(
          `${name.replace(/\.(jpg|jpeg|png)$/i, '')}.txt`,
          annotationTxt
        )
      })

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleExportCreateML = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the annotations.json
      setFilesToZip(Object.keys(collection.annotations).length + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )

      const createMLAnnotations = images.map(({ name, dimensions }) => ({
        image: name,
        annotations: collection.annotations[name].map((annotation) => {
          const relWidth = annotation.x2 - annotation.x
          const relHeight = annotation.y2 - annotation.y
          const midX = (annotation.x + relWidth / 2) * dimensions.width
          const midY = (annotation.y + relHeight / 2) * dimensions.height
          const width = relWidth * dimensions.width
          const height = relHeight * dimensions.height
          return {
            label: annotation.label,
            coordinates: {
              x: Math.round(midX),
              y: Math.round(midY),
              width: Math.round(width),
              height: Math.round(height),
            },
          }
        }),
      }))
      folder.file('annotations.json', JSON.stringify(createMLAnnotations))

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleExportVOC = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the annotations.json
      setFilesToZip(Object.keys(collection.annotations).length + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )
      images.forEach(({ name, dimensions }) => {
        const annotation = (
          <annotation>
            <folder>{bucket}</folder>
            <filename>{name}</filename>
            <size>
              <width>{Math.round(dimensions.width)}</width>
              <height>{Math.round(dimensions.height)}</height>
              <depth>3</depth>
            </size>
            {collection.annotations[name].map((annotation) => (
              <object>
                <name>{annotation.label}</name>
                <pose>Unspecified</pose>
                <truncated>0</truncated>
                <difficult>0</difficult>
                <bndbox>
                  <xmin>{Math.round(annotation.x * dimensions.width)}</xmin>
                  <ymin>{Math.round(annotation.y * dimensions.height)}</ymin>
                  <xmax>{Math.round(annotation.x2 * dimensions.width)}</xmax>
                  <ymax>{Math.round(annotation.y2 * dimensions.height)}</ymax>
                </bndbox>
              </object>
            ))}
          </annotation>
        )
        folder.file(
          `${name.replace(/\.(jpg|jpeg|png)$/i, '')}.xml`,
          ReactDOMServer.renderToStaticMarkup(annotation)
        )
      })

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleExportMaximo = useCallback(
    async (e) => {
      e.stopPropagation()
      setOptionsOpen(false)

      // all the labeled images + the prop.json
      setFilesToZip(Object.keys(collection.annotations).length * 2 + 1)

      const zip = new JSZip()
      const folder = zip.folder(bucket)
      const images = await zipImages(
        endpointForLocationConstraint(location),
        bucket,
        collection,
        folder,
        setFilesZipped
      )
      images.forEach(({ name, dimensions }) => {
        const annotation = (
          <annotation>
            <folder>{bucket}</folder>
            <filename>{name}</filename>
            <size>
              <width>{Math.round(dimensions.width)}</width>
              <height>{Math.round(dimensions.height)}</height>
              <depth>3</depth>
            </size>
            {collection.annotations[name].map((annotation) => (
              <object>
                <name>{annotation.label}</name>
                <pose>Unspecified</pose>
                <truncated>0</truncated>
                <difficult>0</difficult>
                <bndbox>
                  <xmin>{Math.round(annotation.x * dimensions.width)}</xmin>
                  <ymin>{Math.round(annotation.y * dimensions.height)}</ymin>
                  <xmax>{Math.round(annotation.x2 * dimensions.width)}</xmax>
                  <ymax>{Math.round(annotation.y2 * dimensions.height)}</ymax>
                </bndbox>
              </object>
            ))}
          </annotation>
        )
        folder.file(
          `${name.replace(/\.(jpg|jpeg|png)$/i, '')}.xml`,
          ReactDOMServer.renderToStaticMarkup(annotation)
        )
        setFilesZipped((zipped) => (zipped += 1))
      })

      folder.file(
        'prop.json',
        JSON.stringify({
          usage: 'generic',
          name: bucket,
          type: 0,
          scenario: '',
          prop_version: 'PROP_VESION_1',
          pre_process: '',
          category_prop_info: '[]',
          action_prop_info: '[]',
          file_prop_info: '[]',
        })
      )

      setFilesZipped((zipped) => (zipped += 1))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `${bucket}.zip`)
      setFilesToZip(0)
    },
    [bucket, collection, location]
  )

  const handleImportDataset = useCallback(
    async (e) => {
      e.stopPropagation()
      incrementSaving()

      const fileList = getDataTransferItems(e)
      const [zipFile] = fileList.filter((file) =>
        file.name.toLowerCase().endsWith('.zip')
      )

      const [files, annotationsJSON] = await importDataset(zipFile)
      syncAction(bootstrap, [files, annotationsJSON])
      decrementSaving()

      importInputRef.current.value = null
      importInputRef.current.blur()
      setOptionsOpen(false)
    },
    [bootstrap, decrementSaving, incrementSaving, syncAction]
  )

  const handleEmptyLabelImage = useCallback(
    (label) => (e) => {
      e.stopPropagation()
      setOptionsOpen(false)
      setLastHoveredSubOption(undefined)
      if (!collection.labels.includes(label)) {
        syncAction(createLabel, [label])
      }
      syncAction(labelImages, [imageRange, label])
    },
    [collection.labels, imageRange, syncAction]
  )

  return (
    <div className={styles.wrapper}>
      <Downloader current={filesZipped} total={filesToZip} />
      <div onClick={handleClick} className={styles.home}>
        <svg className={styles.homeIcon} viewBox="0 0 32 32">
          <path d="M11.17 6l3.42 3.41.58.59H28v16H4V6h7.17m0-2H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H16l-3.41-3.41A2 2 0 0 0 11.17 4z" />
        </svg>
      </div>
      <div className={styles.headerWrapper}>
        <div className={styles.bucketName}>{sandbox ? 'sandbox' : bucket}</div>
        <div className={styles.options}>
          <div ref={optionsRef} className={styles.options}>
            <div
              id="file"
              className={
                optionsOpen && lastHoveredOption === 'file'
                  ? styles.optionOpen
                  : styles.option
              }
              onClick={handleOptionClick}
              onMouseEnter={handleOptionHover}
            >
              File
              <div
                className={
                  optionsOpen && lastHoveredOption === 'file'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                <div
                  className={styles.listItem}
                  onMouseEnter={handleSubOptionHover}
                >
                  Upload media
                  <input
                    className={styles.upload}
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChosen}
                    multiple
                  />
                </div>
                <div
                  className={
                    dissabled.uploadZip ? styles.disabled : styles.listItem
                  }
                  onMouseEnter={handleSubOptionHover}
                >
                  Upload model zip
                  <input
                    className={styles.upload}
                    ref={modelInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleModelChosen}
                  />
                </div>
                <div className={styles.listDivider} />
                <div
                  className={styles.listItem}
                  onMouseEnter={handleSubOptionHover}
                >
                  Import dataset
                  <input
                    className={styles.upload}
                    ref={importInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleImportDataset}
                  />
                </div>
                <div className={styles.listDivider} />
                <div
                  className={
                    dissabled.exportYOLO ? styles.disabled : styles.listItem
                  }
                  onClick={handleExportYOLO}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as YOLO
                </div>
                <div
                  className={
                    dissabled.exportCreateML ? styles.disabled : styles.listItem
                  }
                  onClick={handleExportCreateML}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as Create ML
                </div>
                <div
                  className={
                    dissabled.exportPascalVOC
                      ? styles.disabled
                      : styles.listItem
                  }
                  onClick={handleExportVOC}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as Pascal VOC
                </div>

                <div
                  id="maximo"
                  className={
                    dissabled.exportMaximo
                      ? styles.popwrapper
                      : optionsOpen && lastHoveredSubOption === 'maximo'
                      ? styles.popwrapperOpen
                      : styles.popwrapper
                  }
                  onMouseEnter={handleSubOptionHover}
                >
                  <div
                    className={
                      dissabled.exportMaximo ? styles.disabled : styles.listItem
                    }
                    onClick={handleExportMaximo}
                  >
                    Export as Maximo Visual Inspection
                    <svg
                      className={styles.chevronRightIcon}
                      focusable="false"
                      preserveAspectRatio="xMidYMid meet"
                      width="16"
                      height="16"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <polygon points="17 22 17 13 13 13 13 15 15 15 15 22 12 22 12 24 20 24 20 22 17 22" />
                      <path d="M16,7a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,7Z" />
                      <path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z" />
                    </svg>
                  </div>

                  <div
                    className={
                      dissabled.exportMaximo
                        ? styles.popout
                        : optionsOpen && lastHoveredSubOption === 'maximo'
                        ? styles.popoutOpenTooltip
                        : styles.popout
                    }
                  >
                    <div className={styles.tooltipper}>
                      <h6 className={styles.tooltipH6}>
                        IBM Maximo Visual Inspection
                      </h6>
                      <p className={styles.tooltipP}>
                        A platform tailored for domain experts to label, train
                        and deploy models for variety of industrial use cases.
                        Quickly build solutions at the edge, monitor assets and
                        inspect production lines for quality.
                      </p>
                      <div className={styles.tooltipFooter}>
                        <a
                          href="https://www.ibm.com/products/ibm-maximo-visual-inspection"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.tooltipLink}
                        >
                          Learn more
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    dissabled.exportZip ? styles.disabled : styles.listItem
                  }
                  onClick={handleExportZip}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as zip
                </div>
                <div
                  className={
                    cosResources.length === 0 || dissabled.exportNotebook
                      ? styles.disabled
                      : styles.listItem
                  }
                  onClick={handleExportNotebook}
                  onMouseEnter={handleSubOptionHover}
                >
                  Export as Notebook (.ipynb)
                </div>
              </div>
            </div>

            <div
              id="image"
              className={
                optionsOpen && lastHoveredOption === 'image'
                  ? styles.optionOpen
                  : styles.option
              }
              onClick={handleOptionClick}
              onMouseEnter={handleOptionHover}
            >
              {imageRange.length > 1
                ? `Images (${imageRange.length})`
                : 'Image'}
              <div
                className={
                  optionsOpen && lastHoveredOption === 'image'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                <div
                  className={
                    dissabled.delete ? styles.disabled : styles.listItem
                  }
                  onClick={handleDeleteImage}
                  onMouseEnter={handleSubOptionHover}
                >
                  Delete
                </div>

                <div className={styles.listDivider} />

                <div
                  className={
                    dissabled.markAsNegative ? styles.disabled : styles.listItem
                  }
                  onClick={handleEmptyLabelImage('Negative')}
                  onMouseEnter={handleSubOptionHover}
                >
                  Mark as "Negative"
                </div>

                <div
                  id="mark-as"
                  className={
                    dissabled.markAs
                      ? styles.popwrapper
                      : collection.labels.length > 0 &&
                        optionsOpen &&
                        lastHoveredSubOption === 'mark-as'
                      ? styles.popwrapperOpen
                      : styles.popwrapper
                  }
                  onMouseEnter={handleSubOptionHover}
                >
                  <div
                    className={
                      dissabled.markAs
                        ? styles.disabled
                        : collection.labels.length > 0
                        ? styles.listItem
                        : styles.disabled
                    }
                  >
                    Mark as
                    <svg
                      className={styles.chevronRightIcon}
                      focusable="false"
                      preserveAspectRatio="xMidYMid meet"
                      width="16"
                      height="16"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M22 16L12 26l-1.4-1.4 8.6-8.6-8.6-8.6L12 6z"></path>
                    </svg>
                  </div>

                  <div
                    className={
                      dissabled.markAs
                        ? styles.popout
                        : collection.labels.length > 0 &&
                          optionsOpen &&
                          lastHoveredSubOption === 'mark-as'
                        ? styles.popoutOpen
                        : styles.popout
                    }
                  >
                    {collection.labels.map((label) => (
                      <div
                        className={styles.listItem}
                        onClick={handleEmptyLabelImage(label)}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* <div
              id="trainingruns"
              className={
                optionsOpen && lastHoveredOption === 'trainingruns'
                  ? styles.optionOpen
                  : styles.option
              }
              onClick={handleOptionClick}
              onMouseEnter={handleOptionHover}
            >
              Training runs
              <div
                className={
                  optionsOpen && lastHoveredOption === 'trainingruns'
                    ? styles.optionCardOpen
                    : styles.optionCard
                }
              >
                <div
                  className={styles.listItem}
                  onClick={() => {
                    history.push('/training')
                  }}
                >
                  View all
                </div>
              </div>
            </div> */}
          </div>
          <div className={styles.saved}>
            {saving > 0 ? 'Saving...' : 'Saved'}
          </div>
        </div>
      </div>
      <div className={styles.train} onClick={handleClickTrainWMLV4}>
        <div className={styles.trainText}>Train model with WML</div>
      </div>
      <div className={styles.train} onClick={handleClickTrain}>
        <div className={styles.trainText}>Train model in Colab</div>
      </div>
      {/* {sandbox ? null : !wmlResourcesLoading && wmlResources.length === 0 ? (
        <div className={styles.notification}>
          <div className={styles.notificationTitle}>
            No Machine Learning instance available
          </div>
          <a
            className={styles.notificationAction}
            href="https://cloud.ibm.com/catalog/services/machine-learning?cm_mmc=OSocial_Blog-_-Developer_IBM+Developer-_-WW_WW-_-ibmdev-Github-NSB-cloud-annotations-sign-up&cm_mmca1=000037FD&cm_mmca2=10010797"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create
          </a>
        </div>
      ) : (
        <div
          className={wmlResourcesLoading ? styles.trainDisabled : styles.train}
          onClick={handleClickTrain}
        >
          <div className={styles.trainText}>Train model in Colab</div>
        </div>
      )} */}
      <Toggle
        className={styles.toggle}
        checked={darkModeToggle}
        icons={{
          checked: null,
          unchecked: (
            <img
              alt=""
              src={moon}
              width="16"
              height="16"
              role="presentation"
              style={{ pointerEvents: 'none' }}
            />
          ),
        }}
        onChange={handleToggleDarkMode}
      />
      <ProfileDropDown profile={profile} />
      <Loading active={preparingToTrain} />
      {showWMLModal && ( // resets state
        <PoopUp2
          location={location}
          show={showWMLModal}
          onPrimary={handleTrainWMLModalPrimary}
          onSecondary={handleTrainWMLModalSecondary}
        />
      )}
      {showModal && ( // resets state
        <PoopUp
          location={location}
          show={showModal}
          onPrimary={handleTrainModalPrimary}
          onSecondary={handleTrainModalSecondary}
        />
      )}
    </div>
  )
}

const mapPropsToState = (state) => ({
  cosResources: state.resources.resources,
  activeCOSResource: state.resources.activeResource,
  wmlResourcesLoading: state.wmlResources.loading,
  wmlResources: state.wmlResources.resources,
  saving: state.editor.saving,
  imageRange: state.editor.range,
  collection: state.collection,
})
const mapDispatchToProps = {
  syncAction,
  setActiveImage,
  incrementSaving,
  decrementSaving,
  setActiveWMLResource,
  addModel,
  bootstrap,
}
export default connect(mapPropsToState, mapDispatchToProps)(AppBar)
