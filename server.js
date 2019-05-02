const express = require('express')
const path = require('path')
const request = require('request')
const cookieParser = require('cookie-parser')
const frameguard = require('frameguard')

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

// app.listen(port)
http.listen(port, () => console.log('listening on port ' + port))
