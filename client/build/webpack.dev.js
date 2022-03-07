/*global  __dirname*/
const path = require("path")
const Webpack = require("webpack")
const webpackConfig = require("./webpack.config.js")
const WebpackMerge = require("webpack-merge")
//svg
//const SpriteLoaderPlugin = require("svg-sprite-loader/plugin")

// var devMiddleware = require('webpack-dev-middleware')(compiler, {
//   publicPath: webpackConfig.output.publicPath,
//   stats: {
//     colors: true,
//     chunks: false
//   },
//   watchOptions: {
//     aggregateTimeout: 300,
//     poll: 1000
//   }
// })

module.exports = WebpackMerge.merge(webpackConfig,{
  mode:"development", 
  devServer: {
    host:"0.0.0.0", 
    useLocalIp: true,
    disableHostCheck: true,
    open: "http://127.0.0.1:8080",
    
    overlay: true, // 全屏显示报错 
    port:3000,
    hot:true, // 是否热更新
    inline : true, /* 是否及时更新 */
    contentBase: path.resolve(__dirname, "../dist") //开发服务运行时的文件根目录
    
  },
  //webpack将继续监视任何已解析文件中的更改
  watchOptions: {
    // 当第一个文件更改，会在重新构建前增加延迟
    aggregateTimeout: 200,
    poll: true,
    //忽略目录
    ignored: /node_modules/,
  }
  ,
  plugins:[ 
    //热更新
    new Webpack.HotModuleReplacementPlugin()  
    // new SpriteLoaderPlugin() 
  ]
}) 