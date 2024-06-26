const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack"); // to access built-in plugins
const path = require("path");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: "./index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "mia.bundle.js",
  },
  module: {
    rules: [
      { test: /\.ts$/, use: "ts-loader" },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      url: require.resolve("url/"),
    },
  },
};
