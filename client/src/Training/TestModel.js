import React, { useState, useCallback, useEffect } from 'react'

import MagicDropzone from 'react-magic-dropzone'

import styles from './TestModel.module.css'

const getRetinaContext = canvas => {
  const ctx = canvas.getContext('2d')
  const scale = window.devicePixelRatio
  let width = canvas.width / scale
  let height = canvas.height / scale
  return {
    setWidth: w => {
      width = w
      canvas.style.width = w + 'px'
      canvas.width = w * scale
    },
    setHeight: h => {
      height = h
      canvas.style.height = h + 'px'
      canvas.height = h * scale
    },
    width: width,
    height: height,
    clearAll: () => {
      return ctx.clearRect(0, 0, width * scale, height * scale)
    },
    clearRect: (x, y, width, height) => {
      return ctx.clearRect(x * scale, y * scale, width * scale, height * scale)
    },
    setFont: font => {
      const size = parseInt(font, 10) * scale
      const retinaFont = font.replace(/^\d+px/, size + 'px')
      ctx.font = retinaFont
    },
    setTextBaseLine: textBaseline => {
      ctx.textBaseline = textBaseline
    },
    setStrokeStyle: strokeStyle => {
      ctx.strokeStyle = strokeStyle
    },
    setLineWidth: lineWidth => {
      ctx.lineWidth = lineWidth * scale
    },
    strokeRect: (x, y, width, height) => {
      return ctx.strokeRect(x * scale, y * scale, width * scale, height * scale)
    },
    setFillStyle: fillStyle => {
      ctx.fillStyle = fillStyle
    },
    measureText: text => {
      const metrics = ctx.measureText(text)
      return {
        width: metrics.width / scale,
        actualBoundingBoxLeft: metrics.actualBoundingBoxLeft / scale,
        actualBoundingBoxRight: metrics.actualBoundingBoxRight / scale,
        actualBoundingBoxAscent: metrics.actualBoundingBoxAscent / scale,
        actualBoundingBoxDescent: metrics.actualBoundingBoxDescent / scale
      }
    },
    fillRect: (x, y, width, height) => {
      return ctx.fillRect(x * scale, y * scale, width * scale, height * scale)
    },
    fillText: (text, x, y) => {
      return ctx.fillText(text, x * scale, y * scale)
    }
  }
}

const renderObjectDetection = (ctx, predictions) => {
  ctx.clearAll()
  // Font options.
  const font = `${14}px 'ibm-plex-sans', Helvetica Neue, Arial, sans-serif`
  ctx.setFont(font)
  ctx.setTextBaseLine('top')
  const border = 2
  const xPadding = 8
  const yPadding = 4
  const offset = 2
  const textHeight = parseInt(font, 10) // base 10

  predictions.forEach(prediction => {
    const x = prediction.bbox[0]
    const y = prediction.bbox[1]
    const width = prediction.bbox[2]
    const height = prediction.bbox[3]
    // Draw the bounding box.
    ctx.setStrokeStyle('#0062ff')
    ctx.setLineWidth(border)

    ctx.strokeRect(
      Math.round(x),
      Math.round(y),
      Math.round(width),
      Math.round(height)
    )
    // Draw the label background.
    ctx.setFillStyle('#0062ff')
    const textWidth = ctx.measureText(prediction.label).width
    ctx.fillRect(
      Math.round(x - border / 2),
      Math.round(y - (textHeight + yPadding) - offset),
      Math.round(textWidth + xPadding),
      Math.round(textHeight + yPadding)
    )
  })

  predictions.forEach(prediction => {
    const x = prediction.bbox[0]
    const y = prediction.bbox[1]
    // Draw the text last to ensure it's on top.
    ctx.setFillStyle('#ffffff')
    ctx.fillText(
      prediction.label,
      Math.round(x - border / 2 + xPadding / 2),
      Math.round(y - (textHeight + yPadding) - offset + yPadding / 2)
    )
  })
}

const renderClassification = (ctx, predictions) => {
  ctx.clearAll()

  const font = `${14}px 'ibm-plex-sans', Helvetica Neue, Arial, sans-serif`
  const textHeight = parseInt(font, 10) // base 10
  const xPadding = 8
  const yPadding = 4
  const offset = 2
  ctx.setFont(font)
  ctx.setTextBaseLine('top')

  predictions
    .filter(prediction => prediction.score > 0.5)
    .forEach((prediction, i) => {
      const label = `${prediction.label} ${(prediction.score * 100).toFixed(
        1
      )}%`
      // Draw the label background.
      ctx.setFillStyle('#0062ff')
      const textWidth = ctx.measureText(label).width
      ctx.fillRect(
        Math.round(xPadding),
        Math.round(xPadding + i * (textHeight + yPadding + offset)),
        Math.round(textWidth + xPadding),
        Math.round(textHeight + yPadding)
      )
      // Draw the text last to ensure it's on top.
      ctx.setFillStyle('#ffffff')
      ctx.fillText(
        label,
        Math.round(xPadding + 0 + xPadding / 2),
        Math.round(
          xPadding + i * (textHeight + yPadding + offset) + yPadding / 2
        )
      )
    })
}

const TestModel = ({ show, model }) => {
  const [preview, setPreview] = useState(undefined)
  const [resultsCanvas, setResultsCanvas] = useState(undefined)

  useEffect(() => {
    setPreview(undefined)
    if (resultsCanvas) {
      const ctx = getRetinaContext(resultsCanvas)
      ctx.clearAll()
      ctx.setWidth(0)
      ctx.setHeight(0)
    }
  }, [model, resultsCanvas]) // if model changes kill preview.

  const onDrop = useCallback((accepted, _, links) => {
    setPreview(accepted[0].preview || links[0])
  }, [])

  const onImageChange = useCallback(
    async e => {
      const imgWidth = e.target.clientWidth
      const imgHeight = e.target.clientHeight

      const ctx = getRetinaContext(resultsCanvas)
      ctx.setWidth(imgWidth)
      ctx.setHeight(imgHeight)

      if (model.type === 'detection') {
        const predictions = await model.detect(e.target)
        renderObjectDetection(ctx, predictions)
      } else {
        const predictions = await model.classify(e.target)
        renderClassification(ctx, predictions)
      }
    },
    [model, resultsCanvas]
  )

  if (show) {
    return (
      <div className={styles.wrapper}>
        <MagicDropzone
          className={
            model !== undefined ? styles.dropzone : styles.dropzoneDissabled
          }
          accept="image/jpeg, image/png, .jpg, .jpeg, .png"
          multiple={false}
          onDrop={onDrop}
        >
          {preview ? (
            <div className={styles.imageWrapper}>
              <img
                alt="upload preview"
                onLoad={onImageChange}
                className={styles.image}
                src={preview}
              />
            </div>
          ) : model !== undefined ? (
            'Drag & Drop an Image to Test'
          ) : (
            'Loading model...'
          )}
          <canvas ref={setResultsCanvas} className={styles.canvas} />
        </MagicDropzone>
      </div>
    )
  }
  return <></>
}

export default TestModel
