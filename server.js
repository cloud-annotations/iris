const express = require('express')
const path = require('path')
const request = require('superagent')
const requests = require('request')
const cookieParser = require('cookie-parser')

const app = express()
const port = process.env.PORT || 9000

app.use(cookieParser())

app.get('/api/enpoints', function(req, res) {
  request.get(`https://cos-service.bluemix.net/endpoints`).then(respose => {
    res.send(respose.text)
  })
})

app.get('/api/auth', function(req, res) {
  const apikey = req.query.apikey
  request
    .post('https://iam.bluemix.net/oidc/token')
    .set('Authorization', 'Basic Yng6Yng=')
    .query({
      apikey: apikey,
      response_type: 'cloud_iam',
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
    })
    .then(respose => {
      res
        .cookie('token', respose.body.access_token, {
          expires: new Date(respose.body.expiration * 1000)
        })
        .cookie('refresh_token', respose.body.refresh_token)
        .sendStatus(respose.status)
    })
    .catch(err => {
      res.sendStatus(err.status)
    })
})

app.use(function(req, res, next) {
  request
    .post('https://iam.bluemix.net/identity/token')
    .set('Authorization', 'Basic Yng6Yng=')
    .query({
      refresh_token: req.cookies.refresh_token,
      grant_type: 'refresh_token'
    })
    .then(respose => {
      res
        .cookie('token', respose.body.access_token, {
          expires: new Date(respose.body.expiration * 1000)
        })
        .cookie('refresh_token', respose.body.refresh_token)
      next()
    })
    .catch(err => {
      next()
    })
})

app.get('/api/proxy/:url', function(req, res) {
  const token = req.cookies.token
  request
    .get(`https://${req.params.url}`)
    .set('Authorization', 'bearer ' + token)
    .set('ibm-service-instance-id', req.query.resourceId)
    .buffer()
    .type('xml')
    .then(respose => {
      res.send({ xml: respose.text })
    })
    .catch(err => {
      if (err.status === 403) {
        res.clearCookie('token').sendStatus(err.status)
      }
      res.sendStatus(err.status)
    })
})

app.get('/api/proxy/:url/:bucket', function(req, res) {
  const token = req.cookies.token
  request
    .get(`https://${req.params.url}/${req.params.bucket}`)
    .set('Authorization', 'bearer ' + token)
    .buffer()
    .type('xml')
    .query({
      'list-type': '2'
    })
    .then(respose => {
      res.send({ xml: respose.text })
    })
    .catch(err => {
      if (err.status === 403) {
        res.clearCookie('token').sendStatus(err.status)
      }
      res.sendStatus(err.status)
    })
})

app.put('/api/proxy/:url/:bucket', function(req, res) {
  const token = req.cookies.token
  const url = `https://${req.params.url}/${req.params.bucket}`
  req
    .pipe(
      requests.put({
        url: url,
        headers: {
          Authorization: 'bearer ' + token,
          'ibm-service-instance-id': req.query.resourceId
        }
      })
    )
    .pipe(res)
})

app.get('/api/proxy/:url/:bucket/*', function(req, res) {
  const token = req.cookies.token
  const url = `https://${req.params.url}/${req.params.bucket}/${req.params[0]}`
  req
    .pipe(
      requests.get({
        url: url,
        headers: {
          Authorization: 'bearer ' + token
        }
      })
    )
    .pipe(res)
})

app.put('/api/proxy/:url/:bucket/*', function(req, res) {
  const token = req.cookies.token
  const url = `https://${req.params.url}/${req.params.bucket}/${req.params[0]}`
  req
    .pipe(
      requests.put({
        url: url,
        headers: {
          Authorization: 'bearer ' + token
        }
      })
    )
    .pipe(res)
})

app.delete('/api/proxy/:url/:bucket/*', function(req, res) {
  const token = req.cookies.token
  const url = `https://${req.params.url}/${req.params.bucket}/${req.params[0]}`
  req
    .pipe(
      requests.delete({
        url: url,
        headers: {
          Authorization: 'bearer ' + token
        }
      })
    )
    .pipe(res)
})

app.delete('/api/proxy/:url/:bucket', function(req, res) {
  const token = req.cookies.token
  const url = `https://${req.params.url}/${req.params.bucket}`
  req
    .pipe(
      requests.delete({
        url: url,
        headers: {
          Authorization: 'bearer ' + token
        }
      })
    )
    .pipe(res)
})

app.post('/api/proxy/:url/:bucket', function(req, res) {
  const token = req.cookies.token
  const url = `https://${req.params.url}/${req.params.bucket}?delete=`
  console.log(url)
  req
    .pipe(
      requests.post({
        url: url,
        headers: {
          Authorization: 'bearer ' + token
        }
      })
    )
    .pipe(res)
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client')))

  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client', 'index.html'))
  })
}

app.listen(port)
