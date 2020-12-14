import { fullPrivateEndpointForLocationConstraint } from 'endpoints'

const DEFAULT_GPU = 'k80'

const train_epochs = 500 // 5
const do_fine_tuning = true // false
const batch_size = 100 // 32
const learning_rate = 0.005 // (original script we used had this set to 0.01)
const momentum = 0.9
const dropout_rate = 0.2
const l1_regularizer = 0.0
const l2_regularizer = 0.0001
const label_smoothing = 0.1
const validation_split = 0.2
const do_data_augmentation = false
const rotation_range = 40
const horizontal_flip = true
const width_shift_range = 0.2
const height_shift_range = 0.2
const shear_range = 0.2
const zoom_range = 0.2

const args = [
  train_epochs,
  do_fine_tuning,
  batch_size,
  learning_rate,
  momentum,
  dropout_rate,
  l1_regularizer,
  l2_regularizer,
  label_smoothing,
  validation_split,
  do_data_augmentation,
  rotation_range,
  horizontal_flip,
  width_shift_range,
  height_shift_range,
  shear_range,
  zoom_range,
]

const findStart = `cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh`
const TRAINING_COMMAND = `${findStart} && ./start.sh ${args.join(' ')}`
const TRAINING_IMAGE = 'tensorflow_2.1-py3.7'

async function getCredentials(cosInstance: any) {
  const credentialsEndpoint =
    '/api/proxy/resource-controller.cloud.ibm.com/v2/resource_keys'
  const listCredentialsEndpoint = `${credentialsEndpoint}?name=cloud-annotations-binding&source_crn=${cosInstance.crn}`
  const credentialsList = await fetch(listCredentialsEndpoint).then((res) =>
    res.json()
  )

  if (credentialsList.resources.length > 0) {
    return credentialsList.resources[0].credentials
  }

  // create binding if none exists.
  const res = await fetch(credentialsEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'cloud-annotations-binding',
      source: cosInstance.guid,
      role: 'writer',
      parameters: {
        HMAC: true,
      },
    }),
  }).then((r) => r.json())

  return res.credentials
}

interface CreateModelDefinitionOptions {
  bucket: string
  spaceID: string
  region: string
}
async function createModelDefinition({
  bucket,
  spaceID,
  region,
}: CreateModelDefinitionOptions) {
  const modelDefinitionPayload = {
    name: bucket,
    space_id: spaceID,
    version: '2.0',
    platform: { name: 'python', versions: ['3.7'] },
  }

  return await fetch(
    `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/model_definitions?version=2020-08-01`,
    {
      body: JSON.stringify(modelDefinitionPayload),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  ).then((r) => r.json())
}

interface UploadTrainingZipOptions {
  spaceID: string
  region: string
  definitionID: string
}
async function uploadTrainingZip({
  spaceID,
  definitionID,
  region,
}: UploadTrainingZipOptions) {
  return await fetch(
    `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/model_definitions/${definitionID}/model?version=2020-08-01&space_id=${spaceID}`,
    {
      body: await fetch(
        '/api/proxy/github.com/cloud-annotations/training/releases/latest/download/training.zip'
      ).then((res) => res.blob()),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    }
  ).then((r) => r.json())
}

interface StartTrainingRunOptions {
  spaceID: string
  region: string
  definitionID: string
  bucket: string
  connection: any
}
async function startTrainingRun({
  spaceID,
  definitionID,
  region,
  bucket,
  connection,
}: StartTrainingRunOptions) {
  const trainingPayload = {
    training_data_references: [
      {
        name: 'training_input_data',
        type: 's3',
        connection: connection,
        location: { bucket: bucket },
      },
    ],
    results_reference: {
      name: 'training_results_data',
      connection: connection,
      location: { bucket: bucket },
      type: 's3',
    },
    name: bucket,
    model_definition: {
      id: definitionID,
      command: TRAINING_COMMAND,
      hardware_spec: { name: DEFAULT_GPU, nodes: 1 },
      software_spec: { name: TRAINING_IMAGE },
      parameters: {
        name: bucket,
      },
    },
    space_id: spaceID,
  }

  return await fetch(
    `/api/proxy/${region}.ml.cloud.ibm.com/ml/v4/trainings?version=2020-08-01`,
    {
      body: JSON.stringify(trainingPayload),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  ).then((r) => r.json())
}

interface Options {
  spaceID: string
  bucket: string
  region: string
  wmlInstance: any
  cosInstance: any
}

export async function train({
  spaceID,
  bucket,
  region,
  wmlInstance,
  cosInstance,
}: Options) {
  const credentials = await getCredentials(cosInstance)

  const definition = await createModelDefinition({
    bucket,
    spaceID,
    region: wmlInstance.region_id,
  })

  await uploadTrainingZip({
    spaceID,
    definitionID: definition.metadata.id,
    region: wmlInstance.region_id,
  })

  const { access_key_id, secret_access_key } = credentials.cos_hmac_keys

  const connection = {
    endpoint_url: fullPrivateEndpointForLocationConstraint(region),
    access_key_id: access_key_id,
    secret_access_key: secret_access_key,
  }

  const res = await startTrainingRun({
    spaceID,
    bucket,
    connection,
    definitionID: definition.metadata.id,
    region: wmlInstance.region_id,
  })

  return res
}
