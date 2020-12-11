const dummyData = [
  {
    metadata: {
      created_at: '2020-12-09T17:03:57.823Z',
      description: 'Hand-written Digit Recognition',
      guid: '115ff51c-89c9-4956-b27c-8df34523b798',
      id: '115ff51c-89c9-4956-b27c-8df34523b798',
      modified_at: '2020-12-09T17:07:37.115Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      tags: ['tags_mnist'],
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: '5afd7222-0327-4424-861d-8a61432186b3',
        parameters: { description: 'Tf DL model', name: 'MNIST Tf' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          model: 'training-oZBBeV1Mg/model',
          training: '/115ff51c-89c9-4956-b27c-8df34523b798',
          training_status:
            '/115ff51c-89c9-4956-b27c-8df34523b798/training-status.json',
          bucket: 'coffee-donut-v2',
          logs: 'training-oZBBeV1Mg',
          assets_path: '/115ff51c-89c9-4956-b27c-8df34523b798/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T17:07:37.094Z',
        failure: {
          trace: 'd9e78eacbed4ed995f859e1bf0b1dbf9',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '1', level: 'info' },
        running_at: '2020-12-09T17:04:45.820Z',
        state: 'failed',
      },
      tags: [{ description: 'dome MNIST', value: 'tags_mnist' }],
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
          schema: {
            fields: [{ name: 'text', type: 'string' }],
            id: 'idmlp_schema',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T20:58:48.539Z',
      guid: '11abf487-3bab-4526-99ab-a7200fd8f365',
      id: '11abf487-3bab-4526-99ab-a7200fd8f365',
      modified_at: '2020-12-09T21:03:52.515Z',
      name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'k80' },
        id: '396953de-5774-4705-ac7b-b632b69507f7',
        parameters: { name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
      results_reference: {
        location: {
          path: '',
          model: 'training-2IFZtIJGR/model',
          training: '/11abf487-3bab-4526-99ab-a7200fd8f365',
          training_status:
            '/11abf487-3bab-4526-99ab-a7200fd8f365/training-status.json',
          bucket: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
          logs: 'training-2IFZtIJGR',
          assets_path: '/11abf487-3bab-4526-99ab-a7200fd8f365/assets',
        },
        type: 's3',
        connection: {
          access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
          secret_access_key: 'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T21:03:52.480Z',
        failure: {
          trace: '0af82b2b671587569fecbcafb25b804e',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (2), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '2', level: 'info' },
        running_at: '2020-12-09T21:00:00.099Z',
        state: 'failed',
      },
      training_data_references: [
        {
          location: {
            bucket: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
          },
          type: 's3',
          connection: {
            access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
            secret_access_key:
              'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-11-18T18:39:03.215Z',
      description: 'Hand-written Digit Recognition',
      guid: '2eb14cfd-ab0b-4225-9adf-372bad5a2658',
      id: '2eb14cfd-ab0b-4225-9adf-372bad5a2658',
      modified_at: '2020-11-18T18:40:57.244Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: '83baea00-ddc0-4f9d-bc62-789010525416',
        software_spec: { name: 'tensorflow_1.15-py3.6' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          training: '/2eb14cfd-ab0b-4225-9adf-372bad5a2658',
          training_status:
            '/2eb14cfd-ab0b-4225-9adf-372bad5a2658/training-status.json',
          bucket: 'thumbs-up-down-v2',
          assets_path: '/2eb14cfd-ab0b-4225-9adf-372bad5a2658/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-11-18T18:40:56.223Z',
        failure: {
          trace: '8c9b8f6e9b2a394860913961f15b58a9',
          errors: [
            {
              code: 'unknown_job_execution_error',
              message: 'INVALID_ARGUMENT: Model definition name is not set',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        state: 'failed',
      },
      training_data_references: [
        {
          location: { bucket: 'thumbs-up-down-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
    system: {
      warnings: [
        {
          id: 'deprecated',
          message: 'Runtime tensorflow 1.15 has been deprecated',
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T21:54:03.997Z',
      guid: '324979fd-2c2e-4f7b-bace-09fc70b7d868',
      id: '324979fd-2c2e-4f7b-bace-09fc70b7d868',
      modified_at: '2020-12-09T21:58:41.136Z',
      name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 50 false 32 0.005 0.9 0.2 0 0.0001 0.1 0.2 false 40 true 0.2 0.2 0.2 0.2',
        hardware_spec: { name: 'k80' },
        id: 'e0efe2d4-91fc-483a-84d3-5e57ac30eeaa',
        parameters: { name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
      results_reference: {
        location: {
          path: '',
          model: 'training-nCtv0IJGR/model',
          training: '/324979fd-2c2e-4f7b-bace-09fc70b7d868',
          training_status:
            '/324979fd-2c2e-4f7b-bace-09fc70b7d868/training-status.json',
          bucket: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
          logs: 'training-nCtv0IJGR',
          assets_path: '/324979fd-2c2e-4f7b-bace-09fc70b7d868/assets',
        },
        type: 's3',
        connection: {
          access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
          secret_access_key: 'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T21:58:41.102Z',
        message: { text: '', level: 'info' },
        running_at: '2020-12-09T21:55:44.246Z',
        state: 'completed',
      },
      training_data_references: [
        {
          location: {
            bucket: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
          },
          type: 's3',
          connection: {
            access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
            secret_access_key:
              'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T17:20:18.649Z',
      guid: '344c5b18-52cc-4b06-b851-0d7ee11ddac5',
      id: '344c5b18-52cc-4b06-b851-0d7ee11ddac5',
      modified_at: '2020-12-09T17:21:10.900Z',
      name: 'NICKNICKNICK2',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'k80' },
        id: 'edff7a94-8152-44cb-a8a1-f47444b3539c',
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'NICKNICKNICK2',
      results_reference: {
        location: {
          path: '',
          training: '/344c5b18-52cc-4b06-b851-0d7ee11ddac5',
          training_status:
            '/344c5b18-52cc-4b06-b851-0d7ee11ddac5/training-status.json',
          bucket: 'coffee-donut-v2',
          assets_path: '/344c5b18-52cc-4b06-b851-0d7ee11ddac5/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T17:21:10.663Z',
        failure: {
          trace: 'a98b97f28a020f62a24578284f794ac3',
          errors: [
            {
              code: 'unknown_job_execution_error',
              message: 'INVALID_ARGUMENT: Model definition name is not set',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        state: 'failed',
      },
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-11-18T18:28:59.195Z',
      description: 'Hand-written Digit Recognition',
      guid: '3f949f25-1599-461e-a823-bdebdd73ba6c',
      id: '3f949f25-1599-461e-a823-bdebdd73ba6c',
      modified_at: '2020-11-19T06:00:01.255Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      tags: ['tags_style_transfer_gogh'],
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: 'd943e351-cc79-4c3c-87d6-28e34de86ba6',
        parameters: {
          description: 'Hand-written Digit Recognition',
          name: 'Hand-written Digit Recognition',
        },
        software_spec: { name: 'tensorflow_1.15-py3.6' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          model: 'training-eiC4mJoGR/model',
          training: '/3f949f25-1599-461e-a823-bdebdd73ba6c',
          training_status:
            '/3f949f25-1599-461e-a823-bdebdd73ba6c/training-status.json',
          bucket: 'thumbs-up-down-v2',
          logs: 'training-eiC4mJoGR',
          assets_path: '/3f949f25-1599-461e-a823-bdebdd73ba6c/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: { message: { text: '', level: 'info' }, state: 'running' },
      tags: [{ description: 'dome gogh', value: 'tags_style_transfer_gogh' }],
      training_data_references: [
        {
          location: { bucket: 'thumbs-up-down-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
          },
          schema: {
            fields: [{ name: 'text', type: 'string' }],
            id: 'idmlp_schema',
          },
        },
      ],
    },
    system: {
      warnings: [
        {
          id: 'deprecated',
          message: 'Runtime tensorflow 1.15 has been deprecated',
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T17:43:37.983Z',
      guid: '640badac-48b0-473f-9a19-82d0c189d1bc',
      id: '640badac-48b0-473f-9a19-82d0c189d1bc',
      modified_at: '2020-12-09T17:47:35.543Z',
      name: 'coffee-donut-v2',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'k80' },
        id: 'b1883799-b595-479d-8369-f918a318654d',
        parameters: { name: 'coffee-donut-v2' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'coffee-donut-v2',
      results_reference: {
        location: {
          path: '',
          model: 'training-0mlCkI1Gg/model',
          training: '/640badac-48b0-473f-9a19-82d0c189d1bc',
          training_status:
            '/640badac-48b0-473f-9a19-82d0c189d1bc/training-status.json',
          bucket: 'coffee-donut-v2',
          logs: 'training-0mlCkI1Gg',
          assets_path: '/640badac-48b0-473f-9a19-82d0c189d1bc/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T17:47:35.496Z',
        failure: {
          trace: '7d892c959d7526a0af574fd070574616',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '1', level: 'info' },
        running_at: '2020-12-09T17:44:45.002Z',
        state: 'failed',
      },
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-11-23T14:55:37.905Z',
      description: 'Hand-written Digit Recognition',
      guid: '7588b7a2-6d0c-409e-a7a3-76ee88a50100',
      id: '7588b7a2-6d0c-409e-a7a3-76ee88a50100',
      modified_at: '2020-11-23T15:16:41.973Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: 'abcef0aa-e4c0-48ab-8d7d-8ae06098f446',
        parameters: {
          description: 'Hand-written Digit Recognition',
          name: 'Hand-written Digit Recognition',
        },
        software_spec: { name: 'tensorflow_1.15-py3.6' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          model: 'training-gD96JjoGg/model',
          training: '/7588b7a2-6d0c-409e-a7a3-76ee88a50100',
          training_status:
            '/7588b7a2-6d0c-409e-a7a3-76ee88a50100/training-status.json',
          bucket: 'thumbs-up-down-v2',
          logs: 'training-gD96JjoGg',
          assets_path: '/7588b7a2-6d0c-409e-a7a3-76ee88a50100/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-11-23T15:16:41.936Z',
        message: { text: '', level: 'info' },
        running_at: '2020-11-23T14:57:26.937Z',
        state: 'completed',
      },
      training_data_references: [
        {
          location: { bucket: 'thumbs-up-down-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
    system: {
      warnings: [
        {
          id: 'deprecated',
          message: 'Runtime tensorflow 1.15 has been deprecated',
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-11-30T16:09:33.175Z',
      description: 'Hand-written Digit Recognition',
      guid: '866096fd-0737-4729-9f3b-c4dbc7201be1',
      id: '866096fd-0737-4729-9f3b-c4dbc7201be1',
      modified_at: '2020-11-30T16:13:52.231Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: 'd46dd88b-343f-4ec4-8a0b-a60c71e03b00',
        parameters: {
          description: 'Hand-written Digit Recognition',
          name: 'Hand-written Digit Recognition',
        },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          model: 'training-g9YePoAGg/model',
          training: '/866096fd-0737-4729-9f3b-c4dbc7201be1',
          training_status:
            '/866096fd-0737-4729-9f3b-c4dbc7201be1/training-status.json',
          bucket: 'altconf-water',
          logs: 'training-g9YePoAGg',
          assets_path: '/866096fd-0737-4729-9f3b-c4dbc7201be1/assets',
        },
        type: 's3',
        connection: {
          access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
          secret_access_key: 'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
          endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-11-30T16:13:52.191Z',
        failure: {
          trace: '750846be5ebc84ad0be273d8356ef958',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        running_at: '2020-11-30T16:11:00.844Z',
        state: 'failed',
      },
      training_data_references: [
        {
          location: { bucket: 'altconf-water' },
          type: 's3',
          connection: {
            access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
            secret_access_key:
              'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
            endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T17:22:09.075Z',
      guid: '8a8c84a7-acfa-47c8-93b1-98ae16dc119d',
      id: '8a8c84a7-acfa-47c8-93b1-98ae16dc119d',
      modified_at: '2020-12-09T17:24:05.543Z',
      name: 'NICKNICKNICK2',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'k80' },
        id: 'd3a240cd-0082-4771-8b60-e16e62d73143',
        parameters: { name: 'NICKNICKNICK2' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'NICKNICKNICK2',
      results_reference: {
        location: {
          path: '',
          training: '/8a8c84a7-acfa-47c8-93b1-98ae16dc119d',
          training_status:
            '/8a8c84a7-acfa-47c8-93b1-98ae16dc119d/training-status.json',
          bucket: 'coffee-donut-v2',
          assets_path: '/8a8c84a7-acfa-47c8-93b1-98ae16dc119d/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T17:24:05.146Z',
        failure: {
          trace: '04c227b569b1e74816f840e4f087f87b',
          errors: [
            {
              code: 'unknown_job_execution_error',
              message: 'Backend response timeout (30s)',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        state: 'failed',
      },
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T21:45:06.255Z',
      guid: '95314d27-45cd-4943-aa4d-fe242f134009',
      id: '95314d27-45cd-4943-aa4d-fe242f134009',
      modified_at: '2020-12-09T21:48:48.583Z',
      name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 5 false 32 0.005 0.9 0.2 0 0.0001 0.1 0.2 false 40 true 0.2 0.2 0.2 0.2',
        hardware_spec: { name: 'k80' },
        id: '4dbdfe74-4e7b-438b-9358-1eb9a0a71dcf',
        parameters: { name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
      results_reference: {
        location: {
          path: '',
          model: 'training-3OcsoIJMg/model',
          training: '/95314d27-45cd-4943-aa4d-fe242f134009',
          training_status:
            '/95314d27-45cd-4943-aa4d-fe242f134009/training-status.json',
          bucket: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
          logs: 'training-3OcsoIJMg',
          assets_path: '/95314d27-45cd-4943-aa4d-fe242f134009/assets',
        },
        type: 's3',
        connection: {
          access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
          secret_access_key: 'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T21:48:48.567Z',
        message: { text: '', level: 'info' },
        running_at: '2020-12-09T21:45:53.534Z',
        state: 'completed',
      },
      training_data_references: [
        {
          location: {
            bucket: 'beerworkshop-donotdelete-pr-xuqjgrtmojawuq',
          },
          type: 's3',
          connection: {
            access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
            secret_access_key:
              'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T17:08:17.588Z',
      description: 'NICKNICKNICK',
      guid: '955d8063-14d3-4623-914f-35febd5bf9c8',
      id: '955d8063-14d3-4623-914f-35febd5bf9c8',
      modified_at: '2020-12-09T17:12:51.668Z',
      name: 'NICKNICKNICK',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      tags: ['tags_mnist'],
    },
    entity: {
      description: 'NICKNICKNICK',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'k80' },
        id: 'a6c83233-f155-45f5-b241-867bf4b531b1',
        parameters: { description: 'Tf DL model', name: 'MNIST Tf' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'NICKNICKNICK',
      results_reference: {
        location: {
          path: '',
          model: 'training-uKIq641Mg/model',
          training: '/955d8063-14d3-4623-914f-35febd5bf9c8',
          training_status:
            '/955d8063-14d3-4623-914f-35febd5bf9c8/training-status.json',
          bucket: 'coffee-donut-v2',
          logs: 'training-uKIq641Mg',
          assets_path: '/955d8063-14d3-4623-914f-35febd5bf9c8/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T17:12:51.654Z',
        failure: {
          trace: '2a150b79c6d923e6c5f617bced1e5c29',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '1', level: 'info' },
        running_at: '2020-12-09T17:10:00.166Z',
        state: 'failed',
      },
      tags: [{ description: 'dome MNIST', value: 'tags_mnist' }],
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
          schema: {
            fields: [{ name: 'text', type: 'string' }],
            id: 'idmlp_schema',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T17:13:17.128Z',
      guid: 'a5cb24d8-34b7-4ec8-a3ae-b386f37760ae',
      id: 'a5cb24d8-34b7-4ec8-a3ae-b386f37760ae',
      modified_at: '2020-12-09T17:14:47.455Z',
      name: 'NICKNICKNICK',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'k80' },
        id: '907a14d3-cc3d-4bd5-92f2-34b8c3bf24f8',
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'NICKNICKNICK',
      results_reference: {
        location: {
          path: '',
          training: '/a5cb24d8-34b7-4ec8-a3ae-b386f37760ae',
          training_status:
            '/a5cb24d8-34b7-4ec8-a3ae-b386f37760ae/training-status.json',
          bucket: 'coffee-donut-v2',
          assets_path: '/a5cb24d8-34b7-4ec8-a3ae-b386f37760ae/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T17:14:47.215Z',
        failure: {
          trace: '98d0ffb0fb0a235d194ccb43120432af',
          errors: [
            {
              code: 'unknown_job_execution_error',
              message: 'INVALID_ARGUMENT: Model definition name is not set',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        state: 'failed',
      },
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-11-30T16:36:50.411Z',
      description: 'Hand-written Digit Recognition',
      guid: 'a8bf130f-8734-4fd0-b744-0614b2d82905',
      id: 'a8bf130f-8734-4fd0-b744-0614b2d82905',
      modified_at: '2020-11-30T16:40:49.683Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: '7b0be39b-e820-4b25-8d2b-38baa164b8fb',
        parameters: {
          description: 'Hand-written Digit Recognition',
          name: 'Hand-written Digit Recognition',
        },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          model: 'training-Thi1UoAGg/model',
          training: '/a8bf130f-8734-4fd0-b744-0614b2d82905',
          training_status:
            '/a8bf130f-8734-4fd0-b744-0614b2d82905/training-status.json',
          bucket: 'altconf-water',
          logs: 'training-Thi1UoAGg',
          assets_path: '/a8bf130f-8734-4fd0-b744-0614b2d82905/assets',
        },
        type: 's3',
        connection: {
          access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
          secret_access_key: 'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
          endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-11-30T16:40:49.620Z',
        failure: {
          trace: '3d2dd465694b8fea1e065fd2e24f029d',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '1', level: 'info' },
        running_at: '2020-11-30T16:37:59.480Z',
        state: 'failed',
      },
      training_data_references: [
        {
          location: { bucket: 'altconf-water' },
          type: 's3',
          connection: {
            access_key_id: 'f205072aefd24d54a7c3d7feb936db48',
            secret_access_key:
              'fb53b417eabbb65a6021bf5ad87dfc4947cd19444510a817',
            endpoint_url: 'https://s3.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T16:55:10.489Z',
      description: 'Hand-written Digit Recognition',
      guid: 'ad806737-65fd-489a-a929-2cbbda4b28ff',
      id: 'ad806737-65fd-489a-a929-2cbbda4b28ff',
      modified_at: '2020-12-09T16:59:07.319Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      tags: ['tags_mnist'],
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: '27b2e410-8e7f-4a1b-b201-9cce73c7e6e9',
        parameters: { description: 'Tf DL model', name: 'MNIST Tf' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          model: 'training-uZkne4JMR/model',
          training: '/ad806737-65fd-489a-a929-2cbbda4b28ff',
          training_status:
            '/ad806737-65fd-489a-a929-2cbbda4b28ff/training-status.json',
          bucket: 'coffee-donut-v2',
          logs: 'training-uZkne4JMR',
          assets_path: '/ad806737-65fd-489a-a929-2cbbda4b28ff/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T16:59:07.276Z',
        failure: {
          trace: '2970a0721532017f3cc11e9698016299',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '1', level: 'info' },
        running_at: '2020-12-09T16:56:15.426Z',
        state: 'failed',
      },
      tags: [{ description: 'dome MNIST', value: 'tags_mnist' }],
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
          schema: {
            fields: [{ name: 'text', type: 'string' }],
            id: 'idmlp_schema',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T16:58:39.087Z',
      description: 'Hand-written Digit Recognition',
      guid: 'b473d608-91ed-4290-94d8-d979d4ff90eb',
      id: 'b473d608-91ed-4290-94d8-d979d4ff90eb',
      modified_at: '2020-12-09T17:02:55.213Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      tags: ['tags_mnist'],
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: '4ada18e1-9d78-4202-8e4b-35a970cf06a8',
        parameters: { description: 'Tf DL model', name: 'MNIST Tf' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          model: 'training--QqF64JGg/model',
          training: '/b473d608-91ed-4290-94d8-d979d4ff90eb',
          training_status:
            '/b473d608-91ed-4290-94d8-d979d4ff90eb/training-status.json',
          bucket: 'coffee-donut-v2',
          logs: 'training--QqF64JGg',
          assets_path: '/b473d608-91ed-4290-94d8-d979d4ff90eb/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T17:02:55.173Z',
        failure: {
          trace: '8fa17a61c6f62171aee74a855a441975',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '1', level: 'info' },
        running_at: '2020-12-09T17:00:02.844Z',
        state: 'failed',
      },
      tags: [{ description: 'dome MNIST', value: 'tags_mnist' }],
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
          schema: {
            fields: [{ name: 'text', type: 'string' }],
            id: 'idmlp_schema',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T15:36:42.582Z',
      description: 'Hand-written Digit Recognition',
      guid: 'd14a9869-7946-4b76-832c-a78aad1f93cf',
      id: 'd14a9869-7946-4b76-832c-a78aad1f93cf',
      modified_at: '2020-12-09T15:40:37.428Z',
      name: 'Hand-written Digit Recognition',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      tags: ['tags_mnist'],
    },
    entity: {
      description: 'Hand-written Digit Recognition',
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'K80' },
        id: 'fe8e62e1-c2cf-4166-9700-7d4df25da961',
        parameters: { description: 'Tf DL model', name: 'MNIST Tf' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'Hand-written Digit Recognition',
      results_reference: {
        location: {
          path: '',
          model: 'training-WivY_VJMg/model',
          training: '/d14a9869-7946-4b76-832c-a78aad1f93cf',
          training_status:
            '/d14a9869-7946-4b76-832c-a78aad1f93cf/training-status.json',
          bucket: 'coffee-donut-v2',
          logs: 'training-WivY_VJMg',
          assets_path: '/d14a9869-7946-4b76-832c-a78aad1f93cf/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T15:40:37.383Z',
        failure: {
          trace: '13818d4a173109dc1c7ffb954c2de233',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '1', level: 'info' },
        running_at: '2020-12-09T15:37:47.323Z',
        state: 'failed',
      },
      tags: [{ description: 'dome MNIST', value: 'tags_mnist' }],
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
          schema: {
            fields: [{ name: 'text', type: 'string' }],
            id: 'idmlp_schema',
          },
        },
      ],
    },
  },
  {
    metadata: {
      created_at: '2020-12-09T17:37:07.867Z',
      guid: 'd53d90f2-ef65-4b1c-b557-25bfc6f993fb',
      id: 'd53d90f2-ef65-4b1c-b557-25bfc6f993fb',
      modified_at: '2020-12-09T17:41:52.319Z',
      name: 'NICKNICKNICK2',
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
    },
    entity: {
      model_definition: {
        command:
          'cd "$(dirname "$(find . -name "start.sh" -maxdepth 2 | head -1)")" && chmod 777 ./start.sh && ./start.sh 500',
        hardware_spec: { name: 'k80' },
        id: '9fc91ec6-a7a7-4074-b5ad-ba64a70a63ac',
        parameters: { name: 'NICKNICKNICK2' },
        software_spec: { name: 'tensorflow_2.1-py3.7' },
      },
      name: 'NICKNICKNICK2',
      results_reference: {
        location: {
          path: '',
          model: 'training-wuDakS1GR/model',
          training: '/d53d90f2-ef65-4b1c-b557-25bfc6f993fb',
          training_status:
            '/d53d90f2-ef65-4b1c-b557-25bfc6f993fb/training-status.json',
          bucket: 'coffee-donut-v2',
          logs: 'training-wuDakS1GR',
          assets_path: '/d53d90f2-ef65-4b1c-b557-25bfc6f993fb/assets',
        },
        type: 's3',
        connection: {
          access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
          secret_access_key: '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
          endpoint_url:
            'https://s3.private.us.cloud-object-storage.appdomain.cloud',
        },
      },
      space: {
        href: '/v4/spaces/9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
        id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      },
      space_id: '9594ac58-e503-4e9a-ba86-7c25ab1d4de7',
      status: {
        completed_at: '2020-12-09T17:41:52.296Z',
        failure: {
          trace: '72be61fce0dcdfd7932a3de614319680',
          errors: [
            {
              code: 'dl_job_failed (C201)',
              message:
                'Learner process crashed (C201) with exit code (1), please check the job logs for more information',
              more_info: 'http://watson-ml-api.mybluemix.net/',
            },
          ],
        },
        message: { text: '1', level: 'info' },
        running_at: '2020-12-09T17:38:59.586Z',
        state: 'failed',
      },
      training_data_references: [
        {
          location: { bucket: 'coffee-donut-v2' },
          type: 's3',
          connection: {
            access_key_id: '7c78831d5b7c457bb7075098e13a3f0b',
            secret_access_key:
              '1b58b779b7a91a57aa2c07215e38437b981c278811b644a2',
            endpoint_url:
              'https://s3.private.us.cloud-object-storage.appdomain.cloud',
          },
        },
      ],
    },
  },
]

export default dummyData
