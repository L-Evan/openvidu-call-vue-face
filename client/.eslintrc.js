module.exports = {
  // vue-eslint- ？
  "parser": "vue-eslint-parser",
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true,
    // 添加jq
    jquery: true, 
  },
  "extends": [
    
    "eslint:recommended",
    "plugin:vue/essential"
  ],
  "parserOptions": {
    // vue-eslint-？
    "parser": "babel-eslint",
    "ecmaVersion": 12
  },
  "plugins": [
    "vue"
  ],
  "rules": {
    "indent": [
      "error", 2
    ],
    "linebreak-style": [
      "error",
      "windows"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "never"
    ]
  }
}
