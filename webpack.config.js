const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: ["./src/views/home.pug"],
  },
  output: {
    filename: "home.html",
    path: path.join(__dirname, "./build"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/views/home.pug",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ["pug-loader"],
      },
    ],
  },
};
