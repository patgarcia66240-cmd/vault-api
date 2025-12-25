const { createServer } = require('../dist/index.js')

let cachedServer = null

module.exports = async (req, res) => {
  // Set CORS headers for preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.status(200).end()
    return
  }

  if (!cachedServer) {
    cachedServer = await createServer()
  }

  // Add CORS headers to all responses
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // Use Fastify's inject method for testing
  const response = await cachedServer.server.inject({
    method: req.method,
    url: req.url,
    headers: req.headers,
    payload: req.body
  })

  res.status(response.statusCode)
  res.setHeader('content-type', response.headers['content-type'])

  // Copy all headers
  Object.keys(response.headers).forEach(key => {
    if (key !== 'content-type') {
      res.setHeader(key, response.headers[key])
    }
  })

  res.send(response.payload)
}
