const { createServer } = require('../apps/server/dist/index.js')

let cachedServer = null

const ALLOWED_ORIGINS = [
  'https://vault-web.vercel.app',
  'http://localhost:5173'
]

function getCorsOrigin(origin) {
  if (!origin) return ALLOWED_ORIGINS[0]
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

module.exports = async (req, res) => {
  const origin = getCorsOrigin(req.headers.origin)

  // --- PRE-FLIGHT ---
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.status(204).end()
    return
  }

  // --- SERVER INIT ---
  if (!cachedServer) {
    cachedServer = await createServer()
    await cachedServer.ready()
  }

  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // --- NORMALIZE URL ---
  const url = req.url.replace(/^\/api/, '') || '/'

  // --- FASTIFY INJECT ---
  const response = await cachedServer.server.inject({
    method: req.method,
    url,
    headers: {
      ...req.headers,
      host: 'localhost'
    },
    payload: req.body ?? undefined
  })

  // --- RESPONSE ---
  res.status(response.statusCode)

  for (const [key, value] of Object.entries(response.headers)) {
    if (
      key.toLowerCase() !== 'content-length' &&
      key.toLowerCase() !== 'transfer-encoding' &&
      key.toLowerCase() !== 'connection'
    ) {
      res.setHeader(key, value)
    }
  }

  res.send(response.payload)
}
