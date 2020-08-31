const isProd = process.env.NODE_ENV !== 'development'

module.exports = {
    'process.env.BACKEND_URL': prod ? '/activity-trends' : ''
  }