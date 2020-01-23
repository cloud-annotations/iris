import React, { useState, useCallback, useEffect } from 'react'

import MagicDropzone from 'react-magic-dropzone'

import styles from './TestModel.module.css'

// const SCORE_DIGITS = 4

const getLabelText = prediction => {
  // const scoreText = prediction.score.toFixed(SCORE_DIGITS)
  return prediction.class //+ scoreText
}

const TestModel = ({ show, model }) => {
  const [preview, setPreview] = useState(undefined)
  const [resultsCanvas, setResultsCanvas] = useState(undefined)

  useEffect(() => {
    setPreview(undefined)
  }, [model]) // if model changes kill preview.

  const onDrop = useCallback((accepted, _, links) => {
    setPreview(accepted[0].preview || links[0])
  }, [])

  const onImageChange = useCallback(
    async e => {
      const imgWidth = e.target.clientWidth
      const imgHeight = e.target.clientHeight

      resultsCanvas.style.width = imgWidth + 'px'
      resultsCanvas.style.height = imgHeight + 'px'

      // Set actual size in memory (scaled to account for extra pixel density).
      const scale = window.devicePixelRatio // Change to 1 on retina screens to see blurry canvas.
      resultsCanvas.width = imgWidth * scale
      resultsCanvas.height = imgHeight * scale

      const predictions = await model.detect(e.target)
      console.log(predictions)

      const ctx = resultsCanvas.getContext('2d')
      // ctx.canvas.width = Math.round(imgWidth)
      // ctx.canvas.height = Math.round(imgHeight)
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      // Font options.
      const font =
        14 * scale + "px 'ibm-plex-sans', Helvetica Neue, Arial, sans-serif"
      ctx.font = font
      ctx.textBaseline = 'top'
      const border = 2 * scale
      const xPadding = 8 * scale
      const yPadding = 4 * scale
      const offset = 2 * scale
      const textHeight = parseInt(font, 10) // base 10

      predictions.forEach(prediction => {
        const x = Math.round(prediction.bbox[0] * scale)
        const y = Math.round(prediction.bbox[1] * scale)
        const width = Math.round(prediction.bbox[2] * scale)
        const height = Math.round(prediction.bbox[3] * scale)
        // Draw the bounding box.
        ctx.strokeStyle = '#0062ff'
        ctx.lineWidth = border

        ctx.strokeRect(x, y, width, height)
        // Draw the label background.
        ctx.fillStyle = '#0062ff'
        const textWidth = ctx.measureText(getLabelText(prediction)).width
        // const textHeight = parseInt(font, 10) // base 10
        ctx.fillRect(
          Math.round(x - border / 2),
          Math.round(y - (textHeight + yPadding) - offset),
          Math.round(textWidth + xPadding),
          Math.round(textHeight + yPadding)
        )
      })

      predictions.forEach(prediction => {
        const x = Math.round(prediction.bbox[0] * scale)
        const y = Math.round(prediction.bbox[1] * scale)
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = '#ffffff'
        ctx.fillText(
          getLabelText(prediction),
          Math.round(x - border / 2 + xPadding / 2),
          Math.round(y - (textHeight + yPadding) - offset + yPadding / 2)
        )
      })
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
