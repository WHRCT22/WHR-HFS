// Server-modules/Websocket-proxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

const wsport = 8084;
const websocketurl = `/wschat`;

const websocketProxy = createProxyMiddleware({
  target: `ws://localhost:${wsport}`,
  ws: true,
  logLevel: 'silent'
});

module.exports = {
  websocketProxy,
  websocketurl,
  wsport
};