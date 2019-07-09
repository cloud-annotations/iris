const express = require('express')
const path = require('path')
const request = require('request')
const cookieParser = require('cookie-parser')
const frameguard = require('frameguard')
const AWS = require('ibm-cos-sdk')

const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const redis = require('socket.io-redis')
const port = process.env.PORT || 9000

app.use(express.static(__dirname + '/public'))

if (process.env.NODE_ENV === 'production') {
  io.adapter(redis({ host: 'redis.default.svc.cluster.local', port: 6379 }))
}

const broadcastRoomCount = room => {
  try {
    io.in(room).clients((_, clients) => {
      io.to(room).emit('theHeadCount', clients.length)
    })
  } catch {}
}

//// socket playground
io.on('connection', socket => {
  socket.on('patch', res => {
    if (socket.bucket) {
      socket.to(socket.bucket).emit('patch', res)
    }
  })

  socket.on('join', ({ bucket, image }) => {
    if (!socket.bucket) {
      socket.bucket = bucket
      socket.join(bucket)
    } else if (socket.bucket !== bucket) {
      socket.leave(socket.bucket)
      socket.bucket = bucket
      socket.join(bucket)
    }

    const imageRoom = `${bucket}:${image}`
    if (!socket.image) {
      socket.image = imageRoom
      socket.join(socket.image)
    } else if (socket.image !== imageRoom) {
      socket.leave(socket.image)
      // let the room know that it left.
      broadcastRoomCount(socket.image)
      socket.image = imageRoom
      socket.join(socket.image)
    }

    broadcastRoomCount(socket.image)
  })

  socket.on('disconnect', () => {
    broadcastRoomCount(socket.image)
  })
})
////

app.use(cookieParser())
app.use(frameguard()) // Prevent click jacking.

const shouldRedirect = host => {
  const check = (host, check) => {
    return host.slice(0, check.length) === check
  }
  const www = 'www.annotations.ai'
  const nonwww = 'annotations.ai'
  // const ingress = 'annotations.us-east.containers.appdomain.cloud'
  return check(host, www) || check(host, nonwww) //|| check(host, ingress)
}

app.enable('trust proxy')
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    shouldRedirect(req.headers.host)
  ) {
    return res.redirect(
      301,
      req.protocol + '://cloud.annotations.ai' + req.originalUrl
    )
  }
  next()
})

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
    console.log('try to set token')
    if (isSuccess(error, response)) {
      setToken(res, body)
      console.log('we set token!')
    }
    console.log('thank you, next')
    next()
  })
})

const redirectUri =
  'https://stagingannotations.us-east.containers.appdomain.cloud/auth/callback'

app.get('/auth/login', (req, res) => {
  let options = {
    url: 'https://iam.cloud.ibm.com/identity/.well-known/openid-configuration',
    method: 'GET'
  }

  // get the proper auth endpoint.
  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let jsonBody = JSON.parse(body)
      console.log(jsonBody)
      const redirectUrl =
        jsonBody.authorization_endpoint +
        '?client_id=' +
        process.env.CLIENT_ID +
        '&redirect_uri=' +
        redirectUri
      res.redirect(redirectUrl)
    } else {
      res.end()
    }
  })
})

app.get('/auth/callback', (req, res) => {
  let code = req.query.code
  console.log('authorizeCallback with code ' + code)

  let options = {
    url: 'https://iam.cloud.ibm.com/identity/.well-known/openid-configuration',
    method: 'GET'
  }

  // get the proper auth endpoint.
  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let jsonBody = JSON.parse(body)

      // Set the headers
      let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET,
            'utf8'
          ).toString('base64')
      }

      // Request parameters
      let options = {
        url: jsonBody.token_endpoint,
        method: 'POST',
        headers: headers,
        form: {
          // client_id: process.env.CLIENT_ID,
          // client_secret: process.env.CLIENT_SECRET,
          grant_type: 'authorization_code',
          bss_account: '19552f679a1f1feba412927e04b32553',
          // response_type: 'cloud_iam',
          redirect_uri: redirectUri,
          code: code
        }
      }

      // Start the request
      request(options, function(error, response, body) {
        console.log('Response from IAM: ' + body)

        if (!error && response.statusCode == 200) {
          // Parse the IAM token and redirect to the done page
          let jsonBody = JSON.parse(body)
          const accessToken = 'bearer ' + jsonBody.access_token
          console.log('Access token: ' + accessToken)
          res.end()
        } else {
          res.end()
        }
      })
    } else {
      res.end()
    }
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
  console.log('proxy request')
  const token = req.cookies.token
  const url = `https://${req.params[0]}`

  const headers = {}
  if (token) {
    headers['Authorization'] = `bearer ${token}`
  }

  req
    .pipe(
      request({
        url: url,
        qs: req.query,
        headers: headers
      })
    )
    .on('error', e => {
      console.log('part 1')
      console.error(e)
      res.sendStatus(500)
    })
    .pipe(res)
    .on('error', e => {
      console.log('part 2')
      console.error(e)
      res.sendStatus(500)
    })
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'))
  })
}

// app.listen(port)
http.listen(port, () => console.log('listening on port ' + port))
