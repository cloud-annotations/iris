const express = require('express')
const path = require('path')
const request = require('superagent')

const app = express()
const port = process.env.PORT || 9000

app.use(express.static(path.join(__dirname, 'client/build')))

app.get('/api/token', function(req, res) {
  request
    .post('https://iam.bluemix.net/oidc/token')
    .query({
      apikey: 'sXN1216NkUnHjTlaQ8Vomkx4eeiF0f4xlq1s7WQnCAJr',
      response_type: 'cloud_iam',
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
    })
    .then(respose => {
      console.log(respose.body.access_token)
      res.sendStatus(respose.status)
    })
    .catch(err => {
      console.error(err)
      res.sendStatus(err.status)
    })
})

app.get('/api/list', function(req, res) {
  request
    .post('https://iam.bluemix.net/oidc/token')
    .query({
      apikey: 'sXN1216NkUnHjTlaQ8Vomkx4eeiF0f4xlq1s7WQnCAJr',
      response_type: 'cloud_iam',
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
    })
    .then(respose => {
      const token = respose.body.access_token
      request
        .get(
          'https://s3-api.us-geo.objectstorage.softlayer.net/my-first-project'
        )
        .set('Authorization', 'bearer ' + token)
        .buffer()
        .type('xml')
        .query({
          'list-type': '2'
        })
        .then(respose => {
          console.log(respose)
          res.send({xml: respose.text})
        })
        .catch(err => {
          console.error(err)
        })
    })
    .catch(err => {
      console.error(err)
    })
})

app.get('/api/image/:id', function(req, res) {
  request
    .post('https://iam.bluemix.net/oidc/token')
    .query({
      apikey: 'sXN1216NkUnHjTlaQ8Vomkx4eeiF0f4xlq1s7WQnCAJr',
      response_type: 'cloud_iam',
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
    })
    .then(respose => {
      const token = respose.body.access_token
      request
        .get(
          `https://s3-api.us-geo.objectstorage.softlayer.net/my-first-project/${req.params.id}`
        )
        .set('Authorization', 'bearer ' + token)
        .buffer()
        .then(respose => {
          res.send(respose.body)
        })
        .catch(err => {
          console.error(err)
        })
    })
    .catch(err => {
      console.error(err)
    })
})

if (process.env.NODE_ENV === 'production') {
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
  })
}

app.listen(port)
