const { createProxyMiddleware } = require("http-proxy-middleware");

const apiProxy = createProxyMiddleware({
  target: "http://localhost:3008",
  changeOrigin: true,
});

module.exports = apiProxy;
