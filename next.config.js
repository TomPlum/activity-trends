const webpack = require('webpack')
console.log("Node Environment: " + process.env.ENVIRONMENT)

const isProd = process.env.ENVIRONMENT === 'production'

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