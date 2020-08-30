const webpack = require('webpack')
console.log("Node Environment: " + process.env.ENVIRONMENT)

const isProd = process.env.ENVIRONMENT !== 'dev'
const assetPrefix = isProd ? '/activity-trends' : '';
const basePath = isProd ? '/docs' : '';

module.exports = {
    exportPathMap: () => ({
        '/': { page: '/' },
    }),
    basePath: basePath,
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