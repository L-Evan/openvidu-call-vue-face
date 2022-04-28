/*global  __dirname*/

// 配置打包 
// const path = require("path")
const webpackConfig = require("./webpack.config.js")
const WebpackMerge = require("webpack-merge")
const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")//压缩  
const TerserPlugin = require("terser-webpack-plugin")
module.exports =  WebpackMerge.merge(webpackConfig,{
  mode: "production", // 开发模式 
  plugins: [
    new CopyWebpackPlugin({ patterns:[{ //复制文件到导出目录
      from: path.resolve(__dirname,"../public/models"),
      to: path.resolve(__dirname,"../dist/models")
    }]} ),
  ],
  optimization: {
    minimize: true, // 可省略，默认最优配置：生产环境，压缩 true。开发环境，不压缩 false 
    minimizer: [ 
    //css压缩
      new CssMinimizerPlugin(),
      //js压缩 webpack5自带
      new TerserPlugin({
        parallel: true, // 可省略，默认开启并行
        terserOptions: {
          toplevel: true, // 最高级别，删除无用代码
          ie8: true,
          safari10: true,
        }
      })
    ]
  },
  //不知道是啥
  // splitChunks:{ 
  //   chunks:'all',
  //   cacheGroups:{
  //     libs: {
  //       name: "chunk-libs",
  //       test: /[\\/]node_modules[\\/]/,
  //       priority: 10,
  //       chunks: "initial" // 只打包初始时依赖的第三方
  //     }
  //   }
  // } 
}) 