/*global process, __dirname*/
// 配置打包 
const path = require("path")
//jquery
const webpack = require("webpack")

const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
//vue
const { VueLoaderPlugin } = require("vue-loader")
//css
const MiniCssExtractPlugin = require("mini-css-extract-plugin")//js中的css合成一个css文件 ？
//const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin') //多css
//模式 
//const devMode = process.argv.indexOf('build/webpack.prod.js') === -1;

const devMode = process.env.npm_lifecycle_event.indexOf("prod") === -1
console.log("现在的环境：" + process.env.npm_lifecycle_event)
//console.log(process.env.npm_lifecycle_event)

module.exports = {
  
  // 入口文件 如果 polyfill 解决新api问题
  entry: [path.resolve(__dirname, "../src/main.js")],
  //导出
  output: {
    filename: "[name].[chunkhash:8].js",      // 打包后的文件名称 [name].[chunkhash:8].js [name].[chunkhash:8]
    path: path.resolve(__dirname, "../dist"), // 打包后的目录
    assetModuleFilename: "images/[hash][ext][query]" //自定义webpack5资源导出路径
  },
  //插件
  plugins: [
    //jquery  https://www.jianshu.com/p/1112e0239515
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      jquery: "jquery",
      "window.jQuery": "jquery",
      Popper: ["popper.js", "default"],
    }),
    //入口配置
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"), //基于这个文件  去引入打包后的main.js
      filename: "index.html",//默认是同名
      chunks: ["main"] // 与入口文件对应的模块名   
    }),
    //vue 它的职责是将你定义过的其它规则复制并应用到 .vue 文件里相应语言的块。例如，如果你有一条匹配 /\.js$/ 的规则，那么它会应用到 .vue 文件里的 <script> 块。
    new VueLoaderPlugin(),
    //css统一文件
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
    }),
    //每次构建前清空 
    new CleanWebpackPlugin(), // 传入数组,指定要删除的目录,默认好像也可以
    
  ],
  //样式加载会直接引入到主html页面内
  module: {
    //缓存模块请求的解析
    unsafeCache: false,
    rules: [
      //  使用vue-loader 加载 .vue 结尾的文件
      {
        test: /\.vue$/,
        use: [{
          loader: "vue-loader",
          options: {
            hotReload: true,
            //这是啥
            compilerOptions: {
              preserveWhitespace: false
            }
          }
        }],
        exclude: /node_modules/  //排除的目录，exclude优先级最高
      },
      // 它会应用到普通的 `.js` 文件  对es6转到es5
      // 以及 `.vue` 文件中的 `<script>` 块
      // 新api并不会转换 例如(promise、Generator、Set、Maps、Proxy等  需要polyfill
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            //应用的补丁,根据目标环境来进行编译和打补丁
            presets: [["@babel/preset-env",
              {
                //根据targets处理
                "useBuiltIns": "entry", //母鸡usage
                //ES3～ES7+ 以及还处在提案阶段的 JavaScript 的实现
                "corejs": 3,
                // 支持chrome 58+ 及 IE 11+ 减小babel包体积
                "targets": {
                  "chrome": 58,
                  "ie": "11",
                }
              },
            ]],
          }
        },
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.(s[ac]ss)$/i,
        use: [ 
          "vue-style-loader", 
          "css-loader",  
          "sass-loader"
        ],
      },
      {
        test: /\.css$/i,
        use: [ 
          {  
            loader:  devMode ? "vue-style-loader" :MiniCssExtractPlugin.loader,// 从右向左解析原则
          },
          "css-loader"
        ]
      }, 
      //静态资源
      {
        // ./images/
        test: /\.(png|jpg|gif)$/i,
        type: "asset/resource",
        // 自定义导出路径 
        generator: {
          // filename: 'images/[hash][ext][query]'
        }
      }, 
      {
        // svg 转雪碧图
        test: /\.svg/,
        type: "asset/inline", 
        use:[ 
          {loader: "svg-sprite-loader",
            options:{
              symbolId: "icon-[name]"
            } ,
          }
        ], 
        include:   path.resolve(__dirname,"../src/icons") , 
           
      },
      {
        // orther svg  
        // 加载fontsvg  SVG 转换为 utf-8 编码的 DataUrl 字符串
        test: /\.svg/, 
        loader:"svg-url-loader" ,
        include:   path.resolve(__dirname,"../src/asset") , 
           
      },
      {
        // import exampleText from './example.txt'
        test: /\.txt/,
        type: "asset/source",
      },
      { test: /\.(eot|woff|ttf)$/, loader: "file-loader" }
    ]
  },
  resolve: {
    alias: {  //别名  
      //运行时版本相比完整版体积要小大约 30%
      "vue$": "vue/dist/vue.runtime.esm.js",
      //完整版, 有编译器，模板字符串编译成为 JavaScript 渲染函数  @/
      "@": path.resolve(__dirname, "../src")
    },
    // path  sidebarItem 报错的时候嘉的
    fallback: {
      "path": require.resolve("path-browserify")
    },
    extensions: ["*", ".js", ".json", ".vue"]
  },
  // 官方推荐生产环境和开发环境的配置
  devtool: devMode ? "inline-source-map" : "source-map",
}