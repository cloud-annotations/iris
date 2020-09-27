import React, { useEffect, useState } from 'react'

const spaceID = '052e608e-aa92-48f5-b45a-945808f15f52'
const baseEndpoint = '/api/proxy/us-south.ml.cloud.ibm.com'
const query = `?space_id=${spaceID}&version=2020-09-01`

function useGet(url) {
  const [state, setState] = useState(undefined)
  useEffect(() => {
    async function main() {
      const res = await fetch(baseEndpoint + url + query).then((r) => r.json())
      setState(res)
    }
    main()
  }, [url])

  return state
}

async function put(url, body) {
  console.log('PUT', url)
  const res = await fetch(baseEndpoint + url, {
    method: 'PUT',
    body: body,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((r) => r.json())
  console.log(url, res)
}

async function post(url, json) {
  console.log('POST', url)
  const res = await fetch(baseEndpoint + url, {
    method: 'POST',
    body: JSON.stringify(json),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((r) => r.json())
  console.log(url, res)
}

function Scratch() {
  const [modelDefID, setModelDefID] = useState(
    '6ef05038-fe7a-4266-8af5-37df021d0da1'
  )
  const trainingRuns = useGet('/ml/v4/trainings')
  const modelDefs = useGet('/ml/v4/model_definitions')
  const currentRun = useGet(
    '/ml/v4/trainings/cc8826af-fe27-4f79-8d29-295b3016983c'
  )

  async function createTrainingRun() {
    post('/ml/v4/trainings?version=2020-09-01', {
      training_data_references: [
        {
          name: 'training_input_data',
          type: 's3',
          // connection: {
          //   endpoint_url:
          //     'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          //   access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          //   secret_access_key:
          //     '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          // },
          location: { bucket: 'thumbs-up-down-v2' },
        },
      ],
      results_reference: {
        name: 'MNIST results',
        // connection: {
        //   endpoint_url:
        //     'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        //   access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
        //   secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
        // },
        location: { bucket: 'nick-res-v1' },
        type: 's3',
      },
      name: 'MNIST mlp',
      description: 'test training modeldef MNIST',
      model_definition: {
        id: modelDefID,
        command: 'ls',
        hardware_spec: { name: 'K80', nodes: 1 },
        software_spec: { name: 'tensorflow_1.15-py3.6' },
        parameters: {
          name: 'MNIST mlp',
          description: 'Simple MNIST mlp model',
        },
      },
      space_id: spaceID,
    })
  }

  async function attachAsset() {
    put(
      `/ml/v4/model_definitions/${modelDefID}/model?space_id=${spaceID}&version=2020-09-01`,
      await fetch(
        '/api/proxy/github.com/cloud-annotations/training/releases/latest/download/training.zip'
      ).then((r) => r.blob())
    )
  }

  async function createModelDef() {
    post(`/ml/v4/model_definitions?space_id=${spaceID}&version=2020-09-01`, {
      name: 'mlp-model-definition',
      space_id: spaceID,
      description: 'mlp-model-definition',
      version: '2.0',
      platform: { name: 'python', versions: ['3.6'] },
      command: 'ls',
    })
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'scroll',
      }}
    >
      <div>Space ID:</div>
      <div>{spaceID}</div>

      <br />
      <div>Model Definitions:</div>
      <pre>
        <code>
          {modelDefs ? JSON.stringify(modelDefs, null, 2) : 'loading...'}
        </code>
      </pre>
      <br />
      <button onClick={createModelDef}>create model definition</button>
      <br />
      <button onClick={attachAsset}>attach asset to model definition</button>
      <br />

      <br />
      <div>Training Runs:</div>
      <pre>
        <code>
          {trainingRuns ? JSON.stringify(trainingRuns, null, 2) : 'loading...'}
        </code>
      </pre>
      <br />
      <input type="text" onChange={(e) => setModelDefID(e.target.value)} />
      <br />
      <button onClick={createTrainingRun}>create training run</button>
      <br />

      <br />
      <div>Training Run:</div>
      <pre>
        <code>
          {currentRun ? JSON.stringify(currentRun, null, 2) : 'loading...'}
        </code>
      </pre>
      <br />
    </div>
  )
}

export default Scratch
