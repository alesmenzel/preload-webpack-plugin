# @alesmenzel/preload-webpack-plugin

## Pre-requisites

This module requires **Webpack >= 5.0.0** and **[html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) >= 5.0.0**.

## Installation

```bash
npm install --save-dev @alesmenzel/preload-webpack-plugin
```

## Usage

```js
const PreloadWebpackPlugin = require('preload-webpack-plugin');

// ...

  plugins: [
    new HtmlWebpackPlugin({ /* ... */ }),
    new PreloadWebpackPlugin({
      include: 'initial',
      rel: 'preload',
    })
  ]
}
```
