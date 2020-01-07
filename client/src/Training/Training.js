import React, { useRef, useState, useEffect } from 'react'

import COS from 'api/COSv2'
import { endpointForLocationConstraint } from 'endpoints'

import styles from './Training.module.css'

const StatusTag = ({ status }) => {
  if (status === 'completed') {
    return <span className={styles.tagSuccess}>{status}</span>
  }
  if (status === 'error' || status === 'failed' || status === 'canceled') {
    return <span className={styles.tagError}>{status}</span>
  }
  return <span className={styles.tagNeutral}>{status}</span>
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

const Training = ({ model }) => {
  const [data, setData] = useState([])
  const [smoothData, setSmoothData] = useState([])
  const [labels, setLabels] = useState([])
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
              // type: 'logarithmic',
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
  }, [data, labels, smoothData])

  useEffect(() => {
    if (
      model &&
      model.entity &&
      model.entity.training_results_reference &&
      model.entity.training_results_reference.location
    ) {
      const {
        bucket,
        model_location
      } = model.entity.training_results_reference.location
      if (model_location && bucket) {
        // TODO: GET THE REAL ENDPOINT SOMEHOW!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        new COS({ endpoint: endpointForLocationConstraint('us-standard') })
          .getObject({
            Bucket: bucket,
            Key: `${model_location}/training-log.txt`
          })
          .then(txt => {
            const lossRegex = /^INFO:tensorflow:loss = ([0-9]+[.][0-9]+), step = ([0-9]*)/gm
            const matches = getMatches(txt, lossRegex)
            const loss = matches[1].map(Number.parseFloat)
            const steps = matches[2].map(m => Number.parseInt(m, 10))
            setData(loss)
            setSmoothData(smoothDataset(loss))
            setLabels(steps)
          })
        return
        // TODO: GET THE REAL ENDPOINT SOMEHOW!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      }
    }

    setData([])
    setSmoothData([])
    setLabels([])
  }, [model])

  const totalStepsRegex = /\.\/start\.sh (\d*)$/
  const trainingCommand =
    model && model.entity.model_definition.execution.command
  const currentStep = labels.length > 0 ? labels[labels.length - 1] + 1 : 0
  const matches = totalStepsRegex.exec(trainingCommand)
  const totalSteps = Number.parseInt(matches && matches[1], 10)
  const percentComplete =
    totalSteps > 0 ? Number.parseInt((currentStep / totalSteps) * 100, 10) : 100

  const projectName = model ? model.entity.model_definition.name : 'loading...'
  const modelID = model ? model.metadata.guid : 'loading...'
  const modelStatus = model ? model.entity.status.state : 'loading...'

  return (
    <>
      <div style={{ width: '745px', margin: '80px auto 0 auto' }}>
        <div
          style={{
            margin: '0 16px 64px 16px',
            display: 'flex'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '300',
                marginBottom: '8px'
              }}
            >
              {projectName}
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--detailText)'
              }}
            >
              <StatusTag status={modelStatus} />
              {modelID}
            </div>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              height: '48px',
              backgroundColor: 'var(--blue)',
              color: '#fff',
              fontWeight: 400,
              fontSize: '14px',
              padding: '0 18px',
              minWidth: '220px',
              cursor: 'pointer',
              alignItems: 'center',
              display: 'flex'
            }}
          >
            <div
              style={{
                paddingRight: '12px'
              }}
            >
              Download model
            </div>

            <svg
              style={{
                height: '16px',
                width: '16px',
                fill: '#ffffff',
                marginLeft: 'auto'
              }}
              focusable="false"
              preserveAspectRatio="xMidYMid meet"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <path d="M26 15L24.59 13.59 17 21.17 17 2 15 2 15 21.17 7.41 13.59 6 15 16 25 26 15z"></path>
              <path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"></path>
              <title>Download</title>
            </svg>
          </div>
        </div>
        <canvas ref={lossGraphCanvas} width="100" height="30" />
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
              Step {currentStep} of {totalSteps}
            </div>
            <div
              style={{
                marginLeft: 'auto'
              }}
            >
              TODO ETA 38min
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
                width: `${percentComplete}%`,
                height: '100%',
                background: 'var(--blue)'
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Training
