const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const WriteFilePlugin = require('write-file-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge({
    target: 'web',
    entry: [
        './app/index'
    ],
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'app')
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/build',
        filename: '[name].bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            },
            {
                test: /(\.css)$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                            modules: true,
                            namedExport: true,
                            camelCase: true,
                            localIdentName: '[local]__[hash:base64:5]'
                        }
                    },
                    'less-loader'
                ]
            },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
            { test: /\.jpg$/, loader: 'file-loader' },
            { test: /\.(woff|woff2|png|gif|otf)$/, loader: 'url-loader?prefix=font/&limit=65000' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=65000&mimetype=application/octet-stream' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=65000&mimetype=image/svg+xml' }
        ]
    },
    plugins: [
        new WriteFilePlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'app/index.ejs',
            inject: false,
            hash: true
        }),
        new webpack.WatchIgnorePlugin([
            /less\.d\.ts$/
        ])
    ],
    devtool: 'cheap-module-source-map',
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        historyApiFallback: true,
        inline: true
    },
    optimization: {
        minimize: false
    }
});
