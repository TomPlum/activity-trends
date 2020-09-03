const webpack = require('webpack')
const path = require("path");
const withCSS = require('@zeit/next-css');
const withSASS = require('@zeit/next-sass');

console.log("Node Environment: " + process.env.NODE_ENV)

const isProd = process.env.NODE_ENV !== 'development'
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

        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack']
        })

        return config
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'assets/sass')],
    },
    withCSS,
    withSASS,
}