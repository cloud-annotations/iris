import React, { useState, useEffect, useCallback } from 'react'
import savitzkyGolay from 'ml-savitzky-golay'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import socket from 'globalSocket'

import TestModel from './TestModel'

import objectDetector from '@cloud-annotations/object-detection'

import COS from 'api/COSv2'

import styles from './Training.module.css'
import { regionFromEndpoint, endpointFromRegion } from 'endpoints'

const StatusTag = ({ status }) => {
  if (status === 'completed') {
    return <span className={styles.tagSuccess}>{status}</span>
  }
  if (status === 'error' || status === 'failed') {
    return <span className={styles.tagError}>{status}</span>
  }
  if (status === 'canceled') {
    return <span className={styles.tagCanceled}>{status}</span>
  }
  if (status === 'running' || status === 'pending') {
    return <span className={styles.tagTraining}>{status}</span>
  }
  return <span className={styles.tagCanceled}>{status}</span>
}

const smoothDataset2 = data => {
  let windowSize = Number.parseInt(data.length / 23)
  if (windowSize % 2 === 0) {
    windowSize += 1
  }
  windowSize = Math.max(windowSize, 5)
  windowSize = Math.min(windowSize, 21)
  const options = {
    windowSize: windowSize,
    derivative: 0,
    polynomial: 1,
    pad: 'pre'
  }
  const smoothed = savitzkyGolay(data, 1, options)
  return smoothed
}

const smoothDataset = (data, smoothingWeight = 0.6) => {
  // 1st-order IIR low-pass filter to attenuate the higher-
  // frequency components of the time-series.
  let last = data.length > 0 ? 0 : NaN
  let numAccum = 0

  // See #786.
  const isConstant = data.every(v => v === data[0])
  const smoothed = []
  data.forEach(nextVal => {
    if (isConstant || !Number.isFinite(nextVal)) {
      smoothed.push(nextVal)
    } else {
      last = last * smoothingWeight + (1 - smoothingWeight) * nextVal
      numAccum++
      // The uncorrected moving average is biased towards the initial value.
      // For example, if initialized with `0`, with smoothingWeight `s`, where
      // every data point is `c`, after `t` steps the moving average is
      // ```
      //   EMA = 0*s^(t) + c*(1 - s)*s^(t-1) + c*(1 - s)*s^(t-2) + ...
      //       = c*(1 - s^t)
      // ```
      // If initialized with `0`, dividing by (1 - s^t) is enough to debias
      // the moving average. We count the number of finite data points and
      // divide appropriately before storing the data.
      let debiasWeight = 1
      if (smoothingWeight !== 1.0) {
        debiasWeight = 1.0 - Math.pow(smoothingWeight, numAccum)
      }
      smoothed.push(last / debiasWeight)
    }
  })

  return smoothed
}

const getMatches = (string, regex) => {
  let m
  const matches = {}
  while ((m = regex.exec(string)) !== null) {
    m.forEach((match, groupIndex) => {
      const group = matches[groupIndex] || []
      group.push(match)
      matches[groupIndex] = group
    })
  }
  return matches
}

const zipModel = async (model, setCurrent, setTotal) => {
  const {
    bucket,
    model_location
  } = model.entity.training_results_reference.location

  const zip = new JSZip()
  const folder = zip.folder(model.metadata.guid)

  const cos = new COS({
    endpoint: endpointFromRegion(
      regionFromEndpoint(
        model.entity.training_results_reference.connection.endpoint_url
      )
    )
  })
  // TODO: this might not download all files.
  const data = await cos.listObjectsV2({
    Bucket: bucket,
    Prefix: model_location
  })

  const files = data.ListBucketResult.Contents.map(o => o.Key).filter(
    name => !name.endsWith('/')
  )

  setTotal(files.length)

  let current = 0
  const promises = files.map(async file => {
    const data = await cos.getObject(
      {
        Bucket: bucket,
        Key: file
      },
      true
    )
    const name = file.replace(`${model_location}/`, '')
    console.log(`zipping: ${name}`)
    folder.file(name, data, { binary: true })
    current++
    setCurrent(current)
  })
  await Promise.all(promises)

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `${model.metadata.guid}.zip`)
  setTotal(0)
  setCurrent(0)
}

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
            transform: 'rotate(-90deg)'
          }}
          viewBox="-29.8125 -29.8125 59.625 59.625"
        >
          <circle
            style={{
              strokeWidth: 6,
              stroke: '#e0e0e0',
              strokeDashoffset: 0,
              strokeLinecap: 'butt',
              strokeDasharray: 169
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
              strokeDasharray: 169
            }}
            cx="0"
            cy="0"
            r="26.8125"
          ></circle>
        </svg>
        <div
          className={styles.downloaderText}
        >{`Zipping ${current}/${total} files`}</div>
      </div>
    </div>
  )
}

let chart
let dataMap = {}

const getStepsAndLoss = () => {
  const steps = Object.keys(dataMap).map(m => Number.parseInt(m, 10))
  steps.sort((a, b) => a - b)
  const loss = steps.map(step => dataMap[step])
  return [steps, loss]
}

const Training = ({ model, wmlInstanceId, wmlEndpoint }) => {
  const [useLogarithmicScale, setUseLogarithmicScale] = useState(false)

  const [noDataAvailable, setNoDataAvailable] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [filesToZip, setFilesToZip] = useState(0)
  const [filesZipped, setFilesZipped] = useState(0)

  const [lossOveride, setLossOveride] = useState(undefined)
  const [stepOveride, setStepOveride] = useState(undefined)

  const [tfjsModel, setTfjsModel] = useState(undefined)

  // const lossGraphCanvas = useRef()
  const [lossGraphCanvas, setLossGraphCanvas] = useState(undefined)

  useEffect(() => {
    setTfjsModel(undefined)
    if (model !== undefined) {
      try {
        const {
          bucket,
          model_location
        } = model.entity.training_results_reference.location
        if (model_location && bucket) {
          const safeEndpoint = endpointFromRegion(
            regionFromEndpoint(
              model.entity.training_results_reference.connection.endpoint_url
            )
          )
          objectDetector
            .load(
              `/api/proxy/${safeEndpoint}/${bucket}/${model_location}/model_web`
            )
            .then(async tfjsModel => {
              // warm up the model
              const image = new ImageData(1, 1)
              await tfjsModel.detect(image)
              setTfjsModel(tfjsModel)
            })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }, [model])

  useEffect(() => {
    const brightWhite = getComputedStyle(document.body).getPropertyValue(
      '--detailText'
    )
    const dimWhite = getComputedStyle(document.body).getPropertyValue(
      '--ultraDim'
    )
    const smoothedColor = getComputedStyle(document.body).getPropertyValue(
      '--blue'
    )

    if (lossGraphCanvas) {
      const [steps, loss] = getStepsAndLoss()
      window.Chart.defaults.fontFamily =
        "'ibm-plex-sans', Helvetica Neue, Arial, sans-serif"
      window.Chart.defaults.fontColor = brightWhite
      window.Chart.defaults.fontSize = 14
      window.Chart.defaults.fontStyle = 500
      const ctx = lossGraphCanvas.getContext('2d')
      chart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: steps.map(x => (x === 0 ? '' : x)),
          datasets: [
            {
              label: 'Data',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.2)',
              pointRadius: 0,
              data: loss,
              fill: false
            },
            {
              label: 'Smoothed',
              backgroundColor: smoothedColor,
              borderColor: smoothedColor,
              pointRadius: 0,
              data: smoothDataset2(loss),
              fill: false
            }
          ]
        },
        options: {
          events: [],
          tooltips: {
            enabled: false
          },
          legend: {
            display: false
          },
          scales: {
            x: {
              axis: 'x',
              gridLines: {
                drawBorder: true,
                borderColor: brightWhite,
                borderWidth: 1,
                drawOnChartArea: false,
                drawTicks: false,
                color: brightWhite
              },
              ticks: {
                display: true,
                beginAtZero: true,
                autoSkip: true,
                maxTicksLimit: 8,
                maxRotation: 0,
                padding: 6
              }
            },
            y: {
              axis: 'y',
              type: useLogarithmicScale ? 'logarithmic' : 'linear',
              gridLines: {
                drawBorder: true,
                borderColor: brightWhite,
                borderWidth: 1,
                z: -1,
                drawTicks: false,
                color: dimWhite
              },
              ticks: {
                display: true,
                beginAtZero: true,
                autoSkip: true,
                maxTicksLimit: 7,
                padding: 6
              }
            }
          }
        }
      })
    }
  }, [lossGraphCanvas, useLogarithmicScale])

  console.log(model)

  useEffect(() => {
    setIsLoadingData(true)
    const loadData = async () => {
      try {
        const {
          bucket,
          model_location
        } = model.entity.training_results_reference.location

        if (model_location && bucket) {
          const txt = await new COS({
            endpoint: endpointFromRegion(
              regionFromEndpoint(
                model.entity.training_results_reference.connection.endpoint_url
              )
            )
          }).getObject({
            Bucket: bucket,
            Key: `${model_location}/training-log.txt`
          })

          // Examples:
          // ... Step 40: Cross entropy = 0.464557
          // INFO:tensorflow:loss = 0.1023123, step = 105
          const legacyLossRegex = /Step ([0-9]*): Cross entropy = ([0-9]+[.][0-9]+)/gm
          const lossRegex = /^INFO:tensorflow:loss = ([0-9]+[.][0-9]+), step = ([0-9]*)/gm
          let matches = getMatches(txt, lossRegex)
          if (matches[1] === undefined && matches[2] === undefined) {
            const xMatches = getMatches(txt, legacyLossRegex)
            matches[1] = xMatches[2]
            matches[2] = xMatches[1]
          }

          if (matches[1] !== undefined && matches[2] !== undefined) {
            const loss = matches[1].map(Number.parseFloat)
            const steps = matches[2].map(m => Number.parseInt(m, 10))
            steps.forEach((step, i) => {
              dataMap[step] = loss[i]
            })

            const [stepsX, lossX] = getStepsAndLoss()
            const smoothLossX = smoothDataset2(lossX)

            setStepOveride(stepsX[stepsX.length - 1] + 1)
            setLossOveride(smoothLossX[smoothLossX.length - 1])
            setIsLoadingData(false)
            setNoDataAvailable(false)
            if (chart && chart.data) {
              chart.data.labels = stepsX
              chart.data.datasets[0].data = lossX
              chart.data.datasets[1].data = smoothLossX
              chart.update()
            }
            return
          }
        }

        setIsLoadingData(false)
        setNoDataAvailable(true)
      } catch {
        // setIsLoadingData(false)
        setNoDataAvailable(true)
      }
    }
    loadData()
  }, [model])

  const handleToggleScale = useCallback(() => {
    setUseLogarithmicScale(previous => !previous)
  }, [])

  const updateFilesZippedCount = useCallback(current => {
    setFilesZipped(current)
  }, [])
  const updateFilesToZipCount = useCallback(total => {
    setFilesToZip(total)
  }, [])

  const handleZipFiles = useCallback(() => {
    zipModel(model, updateFilesZippedCount, updateFilesToZipCount)
  }, [model, updateFilesToZipCount, updateFilesZippedCount])

  const totalStepsRegex = /\.\/start\.sh (\d*)$/
  const trainingCommand =
    model && model.entity.model_definition.execution.command
  let currentStep = stepOveride !== undefined ? stepOveride : 0

  const matches = totalStepsRegex.exec(trainingCommand)
  const totalSteps = Number.parseInt(matches && matches[1], 10)
  if (model && model.entity.status.state === 'completed') {
    currentStep = totalSteps
  }
  const percentComplete =
    totalSteps > 0 ? Number.parseInt((currentStep / totalSteps) * 100, 10) : 100

  const projectName = model ? model.entity.model_definition.name : 'loading...'
  const modelID = model ? model.metadata.guid : 'loading...'
  const modelStatus = model ? model.entity.status.state : 'loading...'

  let daLoss = '?'
  if (lossOveride !== undefined) {
    daLoss = lossOveride.toFixed(2)
  }

  useEffect(() => {
    if (
      model &&
      wmlEndpoint &&
      wmlInstanceId &&
      (model.entity.status.state === 'pending' ||
        model.entity.status.state === 'running')
    ) {
      socket.emit('connectToTrainingSocket', {
        url: wmlEndpoint,
        modelId: modelID,
        instanceId: wmlInstanceId
      })
    }
  }, [model, modelID, wmlEndpoint, wmlInstanceId])

  useEffect(() => {
    dataMap = {}
    setStepOveride(undefined)
    setLossOveride(undefined)
    const statusListener = res => {
      console.log(res)
      const resJson = JSON.parse(res)

      if (resJson && resJson.status && resJson.status.message) {
        const legacyLossRegex = /Step ([0-9]*): Cross entropy = ([0-9]+[.][0-9]+)/gm
        const lossRegex = /INFO:tensorflow:loss = ([0-9]+[.][0-9]+), step = ([0-9]*)/gm
        let matches = getMatches(resJson.status.message, lossRegex)

        if (matches[1] === undefined && matches[2] === undefined) {
          const xMatches = getMatches(resJson.status.message, legacyLossRegex)
          matches[1] = xMatches[2]
          matches[2] = xMatches[1]
        }

        if (matches[1] !== undefined && matches[2] !== undefined) {
          const loss = matches[1].map(Number.parseFloat)
          const steps = matches[2].map(m => Number.parseInt(m, 10))

          steps.forEach((step, i) => {
            dataMap[step] = loss[i]
          })

          const [stepsX, lossX] = getStepsAndLoss()
          const smoothLossX = smoothDataset2(lossX)

          if (steps.length > 0 && loss.length > 0) {
            if (chart && chart.data) {
              chart.data.labels = stepsX
              chart.data.datasets[0].data = lossX
              chart.data.datasets[1].data = smoothLossX

              setStepOveride(stepsX[stepsX.length - 1] + 1)
              setLossOveride(smoothLossX[smoothLossX.length - 1])
              setIsLoadingData(false)
              setNoDataAvailable(false)
              chart.update()
            }
          }
          return
        }
      }
    }

    socket.on(`trainingStatus-${modelID}`, statusListener)

    return () => {
      socket.removeListener(`trainingStatus-${modelID}`, statusListener)
    }
  }, [modelID])

  if (model) {
    return (
      <div className={styles.wrapper}>
        <Downloader current={filesZipped} total={filesToZip} />
        <div className={styles.topInfoWrapper}>
          <div>
            <div className={styles.title}>{projectName}</div>
            <div className={styles.sub}>
              <StatusTag status={modelStatus} />
              {modelID}
            </div>
          </div>
          <div
            className={model ? styles.button : styles.buttonDisabled}
            onClick={handleZipFiles}
          >
            <div className={styles.buttonText}>Download model</div>
            <svg
              className={styles.buttonIcon}
              focusable="false"
              preserveAspectRatio="xMidYMid meet"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <path d="M26 15L24.59 13.59 17 21.17 17 2 15 2 15 21.17 7.41 13.59 6 15 16 25 26 15z"></path>
              <path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"></path>
            </svg>
          </div>
        </div>

        <TestModel show={modelStatus === 'completed'} model={tfjsModel} />

        <div
          style={{
            margin: '16px 16px 0 16px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              marginLeft: 'auto',
              width: '14px',
              height: '3px',
              marginRight: '8px',
              background: 'var(--blue)'
            }}
          />
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--secondaryText)',
              margin: '8px 0',
              display: 'flex'
            }}
          >
            {`loss (${daLoss})`}
          </div>
        </div>

        {noDataAvailable || isLoadingData ? (
          <div className={styles.graphPlaceholder}>
            <div>{isLoadingData ? 'loading...' : 'No Data Available'}</div>
          </div>
        ) : (
          <canvas
            onClick={handleToggleScale}
            ref={setLossGraphCanvas}
            width="100"
            height="30"
          />
        )}

        <div style={{ margin: '48px 16px 48px 16px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--secondaryText)',
              margin: '8px 0',
              display: 'flex'
            }}
          >
            <div>
              {isLoadingData
                ? 'loading...'
                : `Step ${currentStep} of ${totalSteps}`}
            </div>
            <div
              style={{
                marginLeft: 'auto'
              }}
            >
              {(() => {
                switch (modelStatus) {
                  case 'completed':
                    return 'Done'
                  case 'failed':
                  case 'error':
                    return 'Failed'
                  case 'canceled':
                    return 'Canceled'
                  case 'loading...':
                    return 'loading...'
                  default:
                    return 'ETA ?min'
                }
              })()}
            </div>
          </div>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '2px',
              background: 'var(--progressBg)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: `${isLoadingData ? 0 : percentComplete}%`,
                height: '100%',
                background: 'var(--blue)'
              }}
            />
          </div>
        </div>
        {/* <TestModel model={tfjsModel} /> */}
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <Downloader current={filesZipped} total={filesToZip} />
      <div className={styles.topInfoWrapper}>
        <div>
          <div
            className={styles.skeleton}
            style={{
              width: '220px',
              height: '28px',
              marginBottom: '8px'
            }}
          />
          <div
            className={styles.skeleton}
            style={{
              width: '180px',
              height: '14px'
            }}
          />
          <div
            style={{
              width: '180px',
              height: '10px'
            }}
          />
        </div>
        <div className={styles.buttonDisabled}>
          <div className={styles.buttonText}>Download model</div>
          <svg
            className={styles.buttonIcon}
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M26 15L24.59 13.59 17 21.17 17 2 15 2 15 21.17 7.41 13.59 6 15 16 25 26 15z"></path>
            <path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"></path>
          </svg>
        </div>
      </div>

      <div
        style={{
          margin: '16px 16px 0 16px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          className={styles.skeleton}
          style={{
            marginLeft: 'auto',
            width: '80px',
            height: '14px'
          }}
        />
      </div>
      <div
        style={{
          width: '180px',
          height: '16px'
        }}
      />

      {/* <div className={styles.graphPlaceholder}>
        <div>loading...</div>
      </div> */}

      <div className={styles.graphSkeleton} />

      <div
        style={{
          width: '180px',
          height: '29px'
        }}
      />

      {/* <div
        className={styles.skeleton}
        style={{
          margin: '8px 16px 0 16px',
          width: '713px',
          height: '223.5px'
        }}
      /> */}

      <div style={{ margin: '48px 16px 0 16px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--secondaryText)',
            margin: '8px 0',
            display: 'flex'
          }}
        >
          <div>
            <div
              className={styles.skeleton}
              style={{
                width: '100px',
                height: '14px'
              }}
            />
          </div>
          <div
            style={{
              marginLeft: 'auto'
            }}
          >
            <div
              className={styles.skeleton}
              style={{
                width: '40px',
                height: '14px'
              }}
            />
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '2px',
            background: 'var(--progressBg)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '0%',
              height: '100%',
              background: 'var(--blue)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Training
