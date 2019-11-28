import React, { useCallback, useState } from 'react'

import styles from './AutoLabelPanel.module.css'

import objectDetector from '@cloud-annotations/object-detection'

const MODEL_PATH =
  '/api/proxy/s3.us-west.cloud-object-storage.test.appdomain.cloud/funky/model_web'

const Expanded = ({ handleClick }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.button} onClick={handleClick}>
        <div className={styles.buttonText}>Auto label</div>
        {/* <CreateIconV2 /> */}
      </div>
      <div className={styles.button} onClick={handleClick}>
        <div className={styles.buttonText}>Auto label</div>
        {/* <CreateIconV2 /> */}
      </div>
      <div className={styles.button} onClick={handleClick}>
        <div className={styles.buttonText}>Auto label</div>
        {/* <CreateIconV2 /> */}
      </div>
    </div>
  )
}

const Collapsed = ({ handleClick }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.button} onClick={handleClick}>
        <div className={styles.buttonText}>Auto label</div>
        {/* <CreateIconV2 /> */}
      </div>
    </div>
  )
}

const LoadingModel = ({ handleClick }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonLoading} onClick={handleClick}>
        <div className={styles.buttonText}>Loading model</div>
        {/* <CreateIconV2 /> */}
      </div>
    </div>
  )
}

const AutoLabelPanel = ({ expanded, onExpand, onCollapse }) => {
  const [model, setModel] = useState(undefined)
  // const [predictions, setPredictions] = useState([])
  // useEffect(() => {
  //   if (model && image) {
  //     const img = new Image()
  //     img.onload = () => {
  //       model.detect(img).then(predictions => {
  //         console.log(predictions)
  //         const scaledPredictions = predictions.map(prediction => {
  //           prediction.bbox[0] /= img.width
  //           prediction.bbox[1] /= img.height
  //           prediction.bbox[2] /= img.width
  //           prediction.bbox[3] /= img.height
  //           return prediction
  //         })
  //         setPredictions(scaledPredictions)
  //       })
  //     }
  //     img.src = image
  //   }
  // }, [image, model])

  const handleClick = useCallback(() => {
    if (expanded) {
      onCollapse()
    } else {
      objectDetector.load(MODEL_PATH).then(async model => {
        // warm up the model
        const image = new ImageData(1, 1)
        await model.detect(image)
        setModel(model)
      })
      onExpand()
    }
  }, [expanded, onCollapse, onExpand])

  if (expanded && model === undefined) {
    return <LoadingModel handleClick={handleClick} />
  }
  if (expanded) {
    return <Expanded handleClick={handleClick} />
  }
  return <Collapsed handleClick={handleClick} />
}

export default AutoLabelPanel
