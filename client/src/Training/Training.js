import React, { useRef, useState, useEffect } from 'react'

import logs from './training-log.txt'
import COS from 'api/COSv2'
import { endpointForLocationConstraint } from 'endpoints'

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
  console.log(model)

  const [data, setData] = useState([])
  const [smoothData, setSmoothData] = useState([])
  const [labels, setLabels] = useState([])
  const lossGraphCanvas = useRef()

  useEffect(() => {
    //'rgba(255,255,255,0.57)'
    const brightWhite = getComputedStyle(document.body).getPropertyValue(
      '--detailText'
    )
    //'rgba(255,255,255,0.08)'
    const dimWhite = getComputedStyle(document.body).getPropertyValue(
      '--ultraDim'
    )

    const unSmoothedColor = getComputedStyle(document.body).getPropertyValue(
      '--disabledText'
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
            console.log(txt)
          })
        // TODO: GET THE REAL ENDPOINT SOMEHOW!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      }
    }

    // parse regex
    // eventually open a socket for live updates
    fetch(logs)
      .then(res => res.text())
      .then(txt => {
        const lossRegex = /^INFO:tensorflow:loss = ([0-9]+[.][0-9]+), step = ([0-9]*)/gm
        const matches = getMatches(txt, lossRegex)
        const filtered = matches[1].map(Number.parseFloat)
        // .filter((_, i) => !(i % 0))
        const filteredLabels = matches[2].map(m => Number.parseInt(m, 10))
        // .filter((_, i) => !(i % 0))
        setData(filtered)
        setSmoothData(smoothDataset(filtered))
        setLabels(filteredLabels)
      })
  }, [])

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
              thumbs-up-down
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--detailText)'
              }}
            >
              {/* <span
              style={{
                fontSize: '12px',
                fontWeight: '400',
                lineHeight: '1rem',
                letterSpacing: '.32px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 8px',
                height: '24px',
                maxWidth: '100%',
                margin: '0 8px 0 0',
                borderRadius: '15px',
                backgroundColor: '#fc5b57',
                color: '#97040c'
                // backgroundColor: 'hsl(357, 100%, 15%)',
                // color: 'hsl(357, 75%, 67%)'
              }}
            >
              failed
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '400',
                lineHeight: '1rem',
                letterSpacing: '.32px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 8px',
                height: '24px',
                maxWidth: '100%',
                margin: '0 8px 0 0',
                borderRadius: '15px',
                backgroundColor: 'hsl(0, 0%, 10%)',
                color: 'hsl(0, 0%, 67%)'
              }}
            >
              pending
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '400',
                lineHeight: '1rem',
                letterSpacing: '.32px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 8px',
                height: '24px',
                maxWidth: '100%',
                margin: '0 8px 0 0',
                borderRadius: '15px',
                // backgroundColor: 'hsl(0, 0%, 10%)',
                // color: 'hsl(0, 0%, 67%)'
                backgroundColor: '#c0c0c0',
                color: '#434343'
              }}
            >
              running
            </span> */}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '400',
                  lineHeight: '1rem',
                  letterSpacing: '.32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  height: '24px',
                  maxWidth: '100%',
                  margin: '0 8px 0 0',
                  borderRadius: '15px',
                  backgroundColor: '#57c038',
                  color: '#085a0a',
                  userSelect: 'none'
                  // backgroundColor: 'hsl(136, 100%, 10%)',
                  // color: 'hsl(138, 75%, 67%)'
                }}
              >
                success
              </span>
              model-l438jxim
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
            <div>Step 100 of 1000</div>
            <div
              style={{
                marginLeft: 'auto'
              }}
            >
              ETA 38min
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
                width: '10%',
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
