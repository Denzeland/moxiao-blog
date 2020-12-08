---
title: metro使用入门
description: 本文是用于React Native的JavaScript打包器metro的中文文档
date: 2020-12-8
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - React Native
---

使用[`npm`](https://www.npmjs.com/)安装Metro :

```shell
npm install --save-dev metro metro-core
```

使用[`yarn`](https://yarnpkg.com/)安装Metro:

```shell
yarn add --dev metro metro-core
```

运行`metro`
---------------

你可以通过 [CLI](https://facebook.github.io/metro/docs/cli) 运行Metro或者通过编程方式调用。

### 编程方式运行

首先通过如下方式引入模块:

```js
const Metro = require('metro');
```

在返回的对象中，给出了几个主要的方法:

### 方法 `runMetro(config)`

给定配置，将返回一个`metro-server`服务器. 你可以通过调用通过调用`processRequest`方法将这个服务绑定到适当的 HTTP(S) 服务器:

```js
'use strict';

const http = require('http');

const Metro = require('metro');

Metro.loadConfig().then(config => {
    const metroBundlerServer = Metro.runMetro(config);
    const httpServer = http.createServer(
    metroBundlerServer.processRequest.bind(metroBundlerServer),
);
httpServer.listen(8081);
});
```

为了与Express应用兼容，当请求不能被Metro处理时，processRequest也会调用它的第三个参数。这允许您集成服务器与您的现有服务器，或扩展一个新的:

```js
const httpServer = http.createServer((req, res) => {
  metroBundlerServer.processRequest(req, res, () => {
    // Metro不知道如何处理请求
  });
});
```

如果你使用Express，你可以将processRequest传递作为一个中间件:

```js
const express = require('express');
const app = express();

app.use(
  metroBundlerServer.processRequest.bind(metroBundlerServer),
);

app.listen(8081);
```



### 方法 `runServer(config, options)`

根据给定的配置和选项启动开发服务器。返回服务器。我们建议使用`runMetro`而不是`runServer`, `runMetro`调用这个函数。

#### 配置项

*   `host (string)`: 服务器所在的主机
*   `onReady (Function)`: 当服务器准备好服务请求时调用
*   `secure (boolean)`: **废弃** 服务器是否应该运行在`https`而不是`http`上
*   `secureKey (string)`: **废弃** `secure` 开启时用于https的密钥
*   `secureCert (string)`: **废弃** `secure` 开启时时用于https的证书
*   `secureServerOptions (Object)`: 要传递到Metro的https服务器的options对象。此对象的出现将使Metro的服务器在https上运行。参考[nodejs](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)文档以获得有效的选项

```js
const config = await Metro.loadConfig();

await Metro.runServer(config, {
  port: 8080,
});
```

```js
const fs = require('fs');

const config = await Metro.loadConfig();

await Metro.runServer(config, {
  port: 8080,
  secureServerOptions: {
    ca: fs.readFileSync('path/to/ca'),
    cert: fs.readFileSync('path/to/cert'),
    key: fs.readFileSync('path/to/key'),
  }
});
```



### 方法 `runBuild(config, options)`

给定通常传递给服务器的配置和一组选项，加上一组特定于bundle本身的选项，将构建一个bundle 。返回值是一个Promise，它解析为具有两个属性(`code` 和`map`)的对象。这在构建时非常有用。

#### 配置项

*   `dev (boolean)`: 创建构建的开发版本 (`process.env.NODE_ENV = 'development'`).
*   `entry (string)`: 指定bundle的入口文件
*   `onBegin (Function)`: 在打包开始时调用
*   `onComplete (Function)`: 在打包结束时调用
*   `onProgress (Function)`: 在打包期间调用，每次有关于模块计数/进度的新信息可用时调用
*   `minify (boolean)`: Metro是否应该压缩bundle
*   `out (string)`: 输出包的路径
*   `platform ('web' | 'android' | 'ios')`: 如果提供了一个平台列表，那么要为哪个平台构建bundle
*   `sourceMap (boolean)`: Metro是否应该生成source maps.
*   `sourceMapUrl (string)`: 可以在其中找到source map的URL. 它默认使用与bundle相同的URL，但是将扩展名从.bundle更改为.map。当inlineSourceMap为真时，此属性不起作用

```js
const config = await Metro.loadConfig();

await Metro.runBuild(config, {
  platform: 'ios',
  minify: true,
  out: '/Users/Metro/metro-ios.js'
});
```

### 方法`createConnectMiddleware(config)`

不是创建完整的服务器，而是创建一个响应bundle请求的Connect中间件。然后可以将这个中间件插入到您自己的服务器中。port参数是可选的，仅用于日志记录目的。

#### 配置项

*   `port (number)`: Connect中间件的端口(仅用于日志记录目的)

```js
const Metro = require('metro');
const express = require('express');
const app = express();
const server = require('http').Server(app);

Metro.loadConfig().then(async config => {
  const connectMiddleware = await Metro.createConnectMiddleware(config);
  const {server: {port}} = config;

  app.use(connectMiddleware.middleware);
  server.listen(port);
  connectMiddleware.attachHmrServer(server);
});
```

可用选项
-----------------

### 配置

查看 [Configuring Metro](https://facebook.github.io/metro/docs/configuration) 了解配置选项的详细信息

URL和bundle请求
----------------------

服务器能够为这些构建块提供资源、bundle和source maps

### 资源

为了请求资源，您可以自由地使用require方法，就像它是另一个JS文件一样. 服务器将处理这个特定的require调用，并使它们返回到该文件的路径。当一个资源被请求时(一个资源被它的扩展识别，它必须位于assetext数组中)，通常按原样提供服务。

但是，服务器还能够根据平台和请求的大小(在请求图片的情况下)为特定资源提供服务。你指定平台的方式是通过点后缀(例如.ios)和分辨率通过@后缀(例如@2x)。在使用require时，这将为您透明地处理。

### Bundle

任何JS文件都可以用作包请求的根。该文件将在projectRoot中查找。所有根需要的文件都将递归包括在内。为了请求一个bundle，只需将扩展名从.js更改为.bundle。构建包的选项作为查询参数传递(都是可选的)。

*   `dev`: 以开发模式或不以开发模式构建包。将其与bundle的开发设置1:1映射。将true或false作为字符串传递到URL中
*   `platform`: 请求bundle的平台。可以是ios或安卓系统。与bundle的平台设置1:1映射
*   `minify`: 代码是否应该被压缩。映射成1:1到bundle的minify设置。将true或false作为字符串传递到URL中。
*   `excludeSource`: 源是否应该包含在源映射中。将true或false作为字符串传递到URL中

例如, 请求`http://localhost:8081/foo/bar/baz.bundle?dev=true&platform=ios`将为开发模式下的iOS创建一个foo/bar/baz.js包。

### Source maps

通过使用与bundle相同的URL(因此，与作为根的JS文件相同)，为每个bundle构建源映射。这只会在inlineSourceMap被设置为false时工作。传递给bundle的所有选项都将添加到源映射URL中;否则，它们就不匹配了。

JavaScript转换器
----------------------

JavaScript转换器(babelTransformerPath)是对JS代码进行操作的地方;得益于调用Babel。转换器可以导出两种方法:

### 方法 `transform(module)`

转换代码的强制方法，接收到的对象有关于被转换模块的信息(例如它的路径，代码…)，而返回的对象必须包含一个ast键，它是被转换代码的ast表示。默认的transformer仅通过将代码解析到AST来完成最少量的工作:

```js
const babylon = require('@babel/parser');

module.exports.transform = (file: {filename: string, src: string}) => {
  const ast = babylon.parse(code, {sourceType: 'module'});

  return {ast};
};
```

如果你想要插入babel，你可以简单地通过传递代码给它:

```js
const {transformSync} = require('@babel/core');

module.exports.transform = file => {
  return transformSync(file.src, {
    // Babel options...
  });
};
```

### 方法 `getCacheKey()`

返回转换器的缓存键的可选方法。当使用不同的转换器时，这允许正确地将转换后的文件绑定到转换它的转换器。方法的结果必须是一个字符串