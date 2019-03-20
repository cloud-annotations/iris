const express = require('express')
const path = require('path')
const request = require('request')
const cookieParser = require('cookie-parser')
const frameguard = require('frameguard')

const app = express()
const port = process.env.PORT || 9000

app.use(cookieParser())
app.use(frameguard()) // Prevent click jacking.

// Redirect http to https.
app.enable('trust proxy')
// app.use((req, res, next) => {
//   if (req.headers.host === 'annotations.us-east.containers.appdomain.cloud') {
//     res.redirect('https://' + 'cloud.annotations.ai' + req.url)
//     return
//   }
//   if (req.secure || process.env.NODE_ENV !== 'production') {
//     next()
//   } else {
//     res.redirect('https://' + req.headers.host + req.url)
//   }
// })

const isSuccess = (error, response) => {
  return !error && response.statusCode === 200
}

const setToken = (res, json) => {
  const { access_token, refresh_token, expiration } = json
  res
    .cookie('token', access_token, {
      expires: new Date(expiration * 1000)
    })
    .cookie('refresh_token', refresh_token, {
      expires: new Date(expiration * 1000)
    })
}

// Refresh token every request.
app.use((req, res, next) => {
  const options = {
    method: 'POST',
    json: true,
    url: 'https://iam.bluemix.net/identity/token',
    qs: {
      refresh_token: req.cookies.refresh_token,
      grant_type: 'refresh_token'
    },
    headers: {
      Authorization: 'Basic Yng6Yng='
    }
  }
  request(options, (error, response, body) => {
    if (isSuccess(error, response)) {
      setToken(res, body)
    }
    next()
  })
})

// Authenticate user.
app.get('/api/auth', (req, res) => {
  const options = {
    method: 'POST',
    json: true,
    url: 'https://iam.bluemix.net/oidc/token',
    qs: {
      apikey: req.query.apikey,
      response_type: 'cloud_iam',
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey'
    },
    headers: {
      Authorization: 'Basic Yng6Yng='
    }
  }
  request(options, (error, response, body) => {
    if (isSuccess(error, response)) {
      setToken(res, body)
    }
    res.sendStatus(response.statusCode)
  })
})

// Proxy any other request.
app.all('/api/proxy/*', (req, res) => {
  const token = req.cookies.token
  const url = `https://${req.params[0]}`
  req
    .pipe(
      request({
        url: url,
        qs: req.query,
        headers: {
          Authorization: 'bearer ' + token
        }
      })
    )
    .pipe(res)
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'))
  })
}

app.listen(port)
