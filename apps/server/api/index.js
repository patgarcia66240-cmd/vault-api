const { createServer } = require('../dist/index.js')

let cachedServer = null

module.exports = async (req, res) => {
  if (!cachedServer) {
    cachedServer = await createServer()
  }

  cachedServer.server.emit('request', req, res)
}
