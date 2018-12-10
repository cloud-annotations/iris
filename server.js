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
app.use((req, res, next) => {
  if (req.secure || process.env.NODE_ENV !== 'production') {
    next()
  } else {
    res.redirect('https://' + req.headers.host + req.url)
  }
})

const checkStatus = (error, response) => {
  return new Promise((resolve, reject) => {
    if (!error && response.statusCode === 200) {
      resolve()
    } else {
      reject()
    }
  })
}

const setToken = (res, json) => {
  return new Promise((resolve, reject) => {
    const { access_token, expiration, refresh_token } = json
    res
      .cookie('token', access_token, {
        expires: new Date(expiration * 1000)
      })
      .cookie('refresh_token', refresh_token)
    resolve()
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
    checkStatus(error, response)
      .then(() => setToken(res, body))
      .then(() => next())
      .catch(() => next())
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
    checkStatus(error, response)
      .then(() => setToken(res, body))
      .then(() => res.sendStatus(response.statusCode))
      .catch(() => res.sendStatus(response.statusCode))
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
