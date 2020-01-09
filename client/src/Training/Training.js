import React, { useRef, useState, useEffect, useCallback } from 'react'
import savitzkyGolay from 'ml-savitzky-golay'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import COS from 'api/COSv2'
import { defaultEndpoint } from 'endpoints'

import styles from './Training.module.css'

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

const zipModel = async model => {
  const {
    bucket,
    model_location
  } = model.entity.training_results_reference.location

  const zip = new JSZip()
  const folder = zip.folder(model.metadata.guid)

  const cos = new COS({ endpoint: defaultEndpoint })
  // TODO: this might not download all files.
  const data = await cos.listObjectsV2({
    Bucket: bucket,
    Prefix: model_location
  })

  const files = data.ListBucketResult.Contents.map(o => o.Key).filter(
    name => !name.endsWith('/')
  )

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
  })
  await Promise.all(promises)

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `${bucket}.zip`)
}

const Training = ({ model }) => {
  const [useLogarithmicScale, setUseLogarithmicScale] = useState(false)

  const [data, setData] = useState([])
  const [smoothData, setSmoothData] = useState([])
  const [labels, setLabels] = useState([])

  const [noDataAvailable, setNoDataAvailable] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const lossGraphCanvas = useRef()

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

    if (lossGraphCanvas.current) {
      window.Chart.defaults.fontFamily =
        "'ibm-plex-sans', Helvetica Neue, Arial, sans-serif"
      window.Chart.defaults.fontColor = brightWhite
      window.Chart.defaults.fontSize = 14
      window.Chart.defaults.fontStyle = 500
      const ctx = lossGraphCanvas.current.getContext('2d')
      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: labels.map(x => (x === 0 ? '' : x)),
          datasets: [
            {
              label: 'Data',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.2)',
              pointRadius: 0,
              data: data,
              fill: false
            },
            {
              label: 'Smoothed',
              backgroundColor: smoothedColor,
              borderColor: smoothedColor,
              pointRadius: 0,
              data: smoothData,
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
  }, [data, labels, smoothData, useLogarithmicScale])

  useEffect(() => {
    setIsLoadingData(true)
    const loadData = async () => {
      try {
        const {
          bucket,
          model_location
        } = model.entity.training_results_reference.location

        if (model_location && bucket) {
          // TODO: GET THE REAL ENDPOINT SOMEHOW!
          const txt = await new COS({
            endpoint: defaultEndpoint
          }).getObject({
            Bucket: bucket,
            Key: `${model_location}/training-log.txt`
          })

          // : Step 40: Cross entropy = 0.464557
          const lossRegex = /^INFO:tensorflow:loss = ([0-9]+[.][0-9]+), step = ([0-9]*)/gm
          const matches = getMatches(txt, lossRegex)

          if (Object.keys(matches).length >= 3) {
            const loss = matches[1].map(Number.parseFloat)
            const steps = matches[2].map(m => Number.parseInt(m, 10))
            setIsLoadingData(false)
            setNoDataAvailable(false)
            setData(loss)
            setSmoothData(smoothDataset2(loss))
            setLabels(steps)
            return
          }
        }

        setIsLoadingData(false)
        setNoDataAvailable(true)
        setData([])
        setSmoothData([])
        setLabels([])
      } catch {
        // setIsLoadingData(false)
        setNoDataAvailable(true)
        setData([])
        setSmoothData([])
        setLabels([])
      }
    }
    loadData()
  }, [model])

  const handleToggleScale = useCallback(() => {
    setUseLogarithmicScale(previous => !previous)
  }, [])

  const totalStepsRegex = /\.\/start\.sh (\d*)$/
  const trainingCommand =
    model && model.entity.model_definition.execution.command
  let currentStep = labels.length > 0 ? labels[labels.length - 1] + 1 : 0

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.topInfoWrapper}>
        <div>
          <div className={styles.title}>{projectName}</div>
          <div className={styles.sub}>
            <StatusTag status={modelStatus} />
            {modelID}
          </div>
        </div>
        <div
          className={styles.button}
          onClick={() => {
            zipModel(model)
          }}
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
          {`loss (${
            smoothData.length > 0
              ? smoothData[smoothData.length - 1].toFixed(2)
              : '?'
          })`}
        </div>
      </div>

      {noDataAvailable || isLoadingData ? (
        <div className={styles.graphPlaceholder}>
          <div>{isLoadingData ? 'loading...' : 'No Data Available'}</div>
        </div>
      ) : (
        <canvas
          onClick={handleToggleScale}
          ref={lossGraphCanvas}
          width="100"
          height="30"
        />
      )}

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
    </div>
  )
}

export default Training
