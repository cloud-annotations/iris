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
  console.log(process.env.REDIS_SERVICE_HOST)
  io.adapter(redis({ host: 'redis.default.svc.cluster.local', port: 6379 }))
}

//// socket playground
io.on('connection', socket => {
  socket.on('join', room => {
    if (socket.room) {
      socket.leave(socket.room)
      try {
        const count = io.sockets.adapter.rooms[socket.room].length
        io.to(socket.room).emit('theHeadCount', count)
      } catch {}
    }
    socket.room = room
    socket.join(room)
    console.log(`joining room "${room}"`)
    const count = io.sockets.adapter.rooms[room].length
    io.to(room).emit('theHeadCount', count)
  })
  socket.on('disconnect', () => {
    const count = io.sockets.adapter.rooms[socket.room].length
    io.to(socket.room).emit('theHeadCount', count)
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
