const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // to access built-in plugins
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'mia.bundle.js',
    },
    module: {
        rules: [{ test: /\.ts$/, use: 'ts-loader' }]
    }
};
