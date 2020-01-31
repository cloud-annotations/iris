const express = require('express')
const path = require('path')
const request = require('request')
const cookieParser = require('cookie-parser')
const frameguard = require('frameguard')
const WebSocket = require('ws')

const fs = require('fs')
const spdy = require('spdy')
const compression = require('compression')

const app = express()

let server
if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'localbuild'
) {
  console.log('Using http/2')
  console.log(process.env.TLS_KEY)
  console.log(process.env.TLS_CRT)
  server = spdy.createServer(
    {
      key: process.env.TLS_KEY,
      cert: process.env.TLS_CRT
    },
    app
  )
} else {
  console.log('Using http/1.1')
  server = require('http').Server(app)
}

const io = require('socket.io')(server)

// const http2 = spdy.createServer(
//   {
//     key: fs.readFileSync(path.join(__dirname, 'local_keys', 'server.key')),
//     cert: fs.readFileSync(path.join(__dirname, 'local_keys', 'server.crt'))
//   },
//   app
// )
// const io = require('socket.io')(http2)
// const http = require('http').Server(app)
// const io = require('socket.io')(http)
const redis = require('socket.io-redis')
const port = process.env.PORT || 9000

require('dotenv').config()

const shouldCompress = (req, res) => {
  // don't compress responses asking explicitly not
  if (req.headers['x-no-compression']) {
    return false
  }

  // use compression filter function
  return compression.filter(req, res)
}

app.use(compression({ filter: shouldCompress }))

// app.use(express.static(path.join(__dirname, 'client', 'public')))

let baseEndpoint = 'cloud.ibm.com'
let secure = false
if (process.env.NODE_ENV === 'production') {
  baseEndpoint = 'cloud.ibm.com'
  io.adapter(redis({ host: 'redis.default.svc.cluster.local', port: 6379 }))
  secure = true
}

const broadcastRoomCount = room => {
  try {
    io.in(room).clients((_, clients) => {
      io.to(room).emit('theHeadCount', clients.length)
    })
  } catch {}
}

const parseCookie = cookie => {
  var name = 'access_token='
  var decodedCookie = cookie
  var ca = decodedCookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

//// socket playground
io.on('connection', socket => {
  socket.on('patch', res => {
    if (socket.bucket) {
      socket.to(socket.bucket).emit('patch', res)
    }
  })

  socket.on('connectToTrainingSocket', ({ url, modelId, instanceId }) => {
    const token = parseCookie(socket.request.headers.cookie)

    try {
      const ws = new WebSocket(`${url}/${modelId}/monitor`, {
        headers: {
          'ML-Instance-ID': instanceId,
          Authorization: `bearer ${token}`
        }
      })
      ws.on('message', json => {
        socket.emit(`trainingStatus-${modelId}`, json)
      })
    } catch (error) {
      console.log(error)
    }
  })

  socket.on('join', async ({ endpoint, bucket, image }) => {
    // TODO any socket.join() must verify they can actually access the bucket...
    if (bucket === undefined) {
      console.error('No Bucket.')
      return
    }
    if (endpoint === undefined) {
      console.error('No Endpoint.')
      return
    }

    const url = `https://${endpoint}/${bucket}`
    const token = parseCookie(socket.request.headers.cookie)

    request(
      {
        method: 'GET',
        url: url,
        qs: {
          'list-type': 2,
          'max-keys': 1
        },
        headers: {
          Authorization: `bearer ${token}`
        }
      },
      (error, response, body) => {
        if (isSuccess(error, response)) {
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
        } else {
          console.error(body)
        }
      }
    )
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
    .cookie('access_token', access_token, {
      expires: new Date(expiration * 1000),
      sameSite: 'none',
      secure: secure
    })
    .cookie('refresh_token', refresh_token, {
      expires: new Date(expiration * 1000),
      sameSite: 'none',
      secure: secure
    })
}

const toBase64 = str => {
  return Buffer.from(str, 'utf8').toString('base64')
}

const tokenPoking = (
  res,
  { code, redirectUri, account, refresh_token },
  done
) => {
  const options = {
    url: `https://iam.${baseEndpoint}/identity/.well-known/openid-configuration`,
    method: 'GET'
  }

  // get the proper auth endpoint.
  request(options, (error, response, body) => {
    if (isSuccess(error, response)) {
      const { token_endpoint } = JSON.parse(body)
      const { CLIENT_ID, CLIENT_SECRET } = process.env

      // Request parameters
      const options = {
        url: token_endpoint,
        method: 'POST',
        headers: {
          Authorization: `Basic ${toBase64(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
        },
        form: {
          grant_type: 'refresh_token'
        },
        json: true
      }

      if (code && redirectUri) {
        options.form.grant_type = 'authorization_code'
        options.form.redirect_uri = redirectUri
        options.form.code = code
      }

      if (refresh_token) {
        options.form.refresh_token = refresh_token
      }

      if (account) {
        options.form.bss_account = account
      }

      // Start the request
      request(options, function(error, response, body) {
        if (isSuccess(error, response)) {
          setToken(res, body)
          done(body)
        } else {
          console.error(error)
          console.error(body)
          res.end()
        }
      })
    } else {
      res.end()
    }
  })
}

// Refresh the token anytime we try to save something.
app.put('/api/proxy/*', (req, res, next) => {
  tokenPoking(res, { refresh_token: req.cookies.refresh_token }, () => {
    next()
  })
})

app.get('/auth/login', (req, res) => {
  const redirectUri = `${req.protocol}://${req.get(
    'host'
  )}/auth/callback?state=${encodeURIComponent(req.query.state)}`

  const options = {
    url: `https://iam.${baseEndpoint}/identity/.well-known/openid-configuration`,
    method: 'GET'
  }

  // get the proper auth endpoint.
  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const { CLIENT_ID } = process.env
      const { authorization_endpoint } = JSON.parse(body)
      const redirectUrl = `${authorization_endpoint}?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}`
      res.redirect(redirectUrl)
    } else {
      res.end()
    }
  })
})

app.get('/auth/callback', (req, res) => {
  const { code, state } = req.query
  const redirectUri = `${req.protocol}://${req.get(
    'host'
  )}/auth/callback?state=${state}`

  tokenPoking(res, { code: code, redirectUri: redirectUri }, () => {
    if (!state.startsWith('/')) {
      res.redirect('/')
    } else {
      res.redirect(state)
    }
  })
})

app.get('/auth/userinfo', (req, res) => {
  const { access_token } = req.cookies

  const options = {
    url: `https://iam.${baseEndpoint}/identity/.well-known/openid-configuration`,
    method: 'GET'
  }

  // get the proper auth endpoint.
  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const { userinfo_endpoint } = JSON.parse(body)
      const options = {
        url: userinfo_endpoint,
        headers: {
          Authorization: 'bearer ' + access_token
        },
        method: 'GET'
      }
      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          res.send(JSON.parse(body).iam_id)
        } else {
          res.end()
        }
      })
    } else {
      res.end()
    }
  })
})

app.get('/api/upgrade-token', (req, res) => {
  const { refresh_token } = req.cookies
  const { account } = req.query
  tokenPoking(res, { refresh_token: refresh_token, account: account }, () => {
    res.end()
  })
})

app.get('/api/accounts', (req, res) => {
  const { access_token } = req.cookies

  const options = {
    url: `https://accounts.${baseEndpoint}/coe/v2/accounts`,
    method: 'GET',
    headers: {
      Authorization: 'bearer ' + access_token
    },
    json: true
  }

  request(options, function(error, response, body) {
    if (isSuccess(error, response)) {
      const { resources } = body
      const slim = resources.map(account => ({
        accountId: account.metadata.guid,
        name: account.entity.name,
        softlayer: account.entity.bluemix_subscriptions[0].softlayer_account_id
      }))
      res.send(slim)
    } else {
      res.end()
    }
  })
})

app.get('/api/accounts/:id/users/:user', (req, res) => {
  const { access_token } = req.cookies
  const { id, user } = req.params

  const options = {
    url: `https://user-management.${baseEndpoint}/v2/accounts/${id}/users/${user}`,
    method: 'GET',
    headers: {
      Authorization: 'bearer ' + access_token
    },
    json: true
  }

  request(options, function(error, response, body) {
    if (isSuccess(error, response)) {
      res.send(body)
    } else {
      res.end()
    }
  })
})

app.get('/api/cos-instances', (req, res) => {
  let url = `https://resource-controller.${baseEndpoint}/v2/resource_instances?resource_id=dff97f5c-bc5e-4455-b470-411c3edbe49c`
  const { access_token } = req.cookies

  const { next_docid, account_id } = req.query

  if (next_docid) {
    url += `&next_docid=${next_docid}`
  }

  if (account_id) {
    url += `&account_id=${account_id}`
  }

  const options = {
    url: url,
    method: 'GET',
    headers: {
      Authorization: 'bearer ' + access_token
    },
    json: true
  }

  request(options, function(error, response, body) {
    if (isSuccess(error, response)) {
      res.send(body)
    } else {
      res.end()
    }
  })
})

app.get('/api/wml-instances', (req, res) => {
  let url = `https://resource-controller.${baseEndpoint}/v2/resource_instances?resource_id=51c53b72-918f-4869-b834-2d99eb28422a`
  const { access_token } = req.cookies

  const { next_docid, account_id } = req.query

  if (next_docid) {
    url += `&next_docid=${next_docid}`
  }

  if (account_id) {
    url += `&account_id=${account_id}`
  }

  const options = {
    url: url,
    method: 'GET',
    headers: {
      Authorization: 'bearer ' + access_token
    },
    json: true
  }

  request(options, function(error, response, body) {
    if (isSuccess(error, response)) {
      res.send(body)
    } else {
      res.end()
    }
  })
})

// Proxy any other request.
app.all('/api/proxy/*', (req, res) => {
  const token = req.cookies.access_token
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
      console.error(e)
      res.sendStatus(500)
    })
    .pipe(res)
    .on('error', e => {
      console.error(e)
      res.sendStatus(500)
    })
})

if (process.env.NODE_ENV === 'production') {
  app.get('/install.sh', (_, res) => {
    res
      .set({
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      })
      .sendFile(path.join(__dirname, 'client', 'install.sh'))
  })

  app.use(express.static(path.join(__dirname, 'client')))

  // give all the routes to react
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'))
  })
}

if (process.env.NODE_ENV === 'localbuild') {
  console.log('welcome to your local build')

  app.get('/install.sh', (_, res) => {
    res
      .set({
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      })
      .sendFile(path.join(__dirname, 'client', 'build', 'install.sh'))
  })

  app.use(express.static(path.join(__dirname, 'client', 'build')))

  // give all the routes to react
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
  })
}

server.listen(port, () => console.log('listening on port ' + port))
