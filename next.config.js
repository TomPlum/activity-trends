const webpack = require('webpack')
const env = require('dotenv').config()

const isProd = (process.env.NODE_ENV || 'production') === 'production'

const assetPrefix = isProd ? '/activity-trends' : ''

module.exports = {
    exportPathMap: () => ({
        '/': { page: '/' },
    }),
    assetPrefix: assetPrefix,
    webpack: config => {
        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.ASSET_PREFIX': JSON.stringify(assetPrefix),
            }),
        );

        return config
    },
}

//CSS Configuration
/*const withCSS = require('@zeit/next-css')
module.exports = withCSS({
    cssModules: true
})*/