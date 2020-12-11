interface WatsonV2 {
  version: 2
  training_data: WatsonV2TrainingData
  service_guid: string
}

interface WatsonV2TrainingData {
  classes: WatsonV2Class[]
  images: WatsonV2Image[]
}

interface WatsonV2Class {
  name: string
  images: string[]
  trained: boolean
  negative?: boolean
}

interface WatsonV2Image {
  fileName: string
  path: string
  sourceFileAssetId: string
  sourceFileName: string
  size: number
  trained: boolean
}

function watsonConvert(annotations: any) {
  switch (annotations.version) {
    case 2:
      try {
        return convertV2(annotations)
      } catch (e) {
        console.log('error converting')
        console.log(e)
        return undefined
      }
    default:
      console.log('unsupported watson annotation version')
      return undefined
  }
}

interface CloudAnnotationsAnnotation {
  label: string
}

interface CloudAnnotations {
  version: string
  type: 'classification' | 'localization'
  labels: string[]
  annotations: { [key: string]: CloudAnnotationsAnnotation[] }
}

function convertV2(annotations: WatsonV2) {
  const converted: CloudAnnotations = {
    version: '1.0',
    type: 'classification',
    labels: annotations.training_data.classes.map((c) => c.name),
    annotations: {},
  }

  for (let c of annotations.training_data.classes) {
    for (let i of c.images) {
      const filename = i.split('/').pop()
      const image = annotations.training_data.images.find(
        (im) => im.fileName === filename
      )

      if (image === undefined) {
        continue
      }

      const fullFilePath = `watson_vr/tmp/${image.sourceFileAssetId}/${image.sourceFileName}/${image.path}`
      converted.annotations[fullFilePath] = [
        {
          label: c.name,
        },
      ]
    }
  }

  return converted
}

export default watsonConvert
