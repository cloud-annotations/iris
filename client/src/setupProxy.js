const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
  app.use('/api', createProxyMiddleware({ target: 'http://localhost:9000/' }))
  app.use('/auth', createProxyMiddleware({ target: 'http://localhost:9000/' }))
  app.use(
    '/socket.io',
    createProxyMiddleware({ target: 'http://localhost:9000/' })
  )
}
