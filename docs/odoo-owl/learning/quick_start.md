---
description: odoo官方开发的前端MVVM框架OWL的快速如何开始一个Owl项目文档的中文翻译
date: 2020-12-10
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - odoo
 - owl
---

# 🦉 如何开始一个Owl项目🦉

## 目录

- [概述](#概述)
- [简单的html文件](#简单的html文件)
- [使用静态服务器](#使用静态服务器)
- [标准的Javascript项目](#标准的Javascript项目)

## 概述

正因为如此，仅仅开始一个项目通常不是一件简单的事情。一些框架提供了自己的工具来帮助实现这一点。但是，您必须集成并了解这些应用程序是如何工作的。

Owl被设计为完全不需要工具就可以使用。正因为如此，Owl可以“轻松地”集成到现代构建工具链中。在本节中，我们将讨论启动项目的几种不同设置，每种设置在不同的情况下都有优缺点。

## 简单的html文件

最简单的设置如下：一个包含你自己代码的简单javascript文件。为此，让我们创建以下文件结构：

```
hello_owl/
  index.html
  owl.js
  app.js
```

`owl.js`可以从[https://github.com/odoo/owl/releases](https://github.com/odoo/owl/releases)上下载一个最新版本， 它是一个单独的javascript文件，将所有的Owl内容导出到全局`owl`对象中。

现在, `index.html` 应当包含如下内容：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Hello Owl</title>
    <script src="owl.js"></script>
    <script src="app.js"></script>
  </head>
  <body></body>
</html>
```

并且`app.js` 的内容如下：

```js
const { Component, mount } = owl;
const { xml } = owl.tags;
const { whenReady } = owl.utils;

// Owl Components
class App extends Component {
  static template = xml`<div>Hello Owl</div>`;
}

// 初始化代码
function setup() {
  mount(App, target: { document.body })
}

whenReady(setup);
```

现在，只要在浏览器中加载这个html文件，就会显示一条欢迎消息。这种设置并不花哨，但非常简单。根本不需要工具，还可以通过使用Owl的缩小构建进行轻微的优化。

## 使用静态服务器

前面的设置有一个很大的缺点:应用程序代码位于单个文件中。显然，我们可以将它分割成几个文件，并在html页面中添加多个`<script>`标记，但随后我们需要确保以适当的顺序插入脚本，我们需要在全局变量中导出每个文件内容，并且在文件中丢失自动完成功能。

这个问题有一个低技术含量的解决方案：使用原生javascript模块。但是，这有一个要求:出于安全原因，浏览器将不接受通过`file`协议提供的内容上的模块。这意味着我们需要使用静态服务器。

现在把项目结构改成如下形式：

```
hello_owl/
  src/
    app.js
    index.html
    main.js
    owl.js
```

像上面描述的，`owl.js`可以从[https://github.com/odoo/owl/releases](https://github.com/odoo/owl/releases)上下载一个最新版本。

现在, `index.html` 包含如下内容：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Hello Owl</title>
    <script src="owl.js"></script>
    <script src="main.js" type="module"></script>
  </head>
  <body></body>
</html>
```

注意到`main.js` script标签有属性`type="module"` . 这意味着浏览器将把脚本解析为模块，并加载它的所有依赖项。

下面是文件`app.js` 和`main.js`的内容：

```js
// app.js ----------------------------------------------------------------------
const { Component, mount } = owl;
const { xml } = owl.tags;

export class App extends Component {
  static template = xml`<div>Hello Owl</div>`;
}

// main.js ---------------------------------------------------------------------
import { App } from "./app.js";

function setup() {
  mount(App, { target: document.body });
}

owl.utils.whenReady(setup);
```

`main.js`文件导入`app.js`文件。注意，import语句有一个.js后缀，这一点很重要。大多数文本编辑器都能理解这种语法，并提供自动完成功能。

现在，为了执行这段代码，我们需要静态地为src文件夹提供服务。我们使用一个低技术的方法来做到这一点，例如使用python `SimpleHTTPServer`功能:

```
$ cd src
$ python -m SimpleHTTPServer 8022    # now content is available at localhost:8022
```

另一种更“javascript”的方法是创建一个`npm`应用程序。为此，我们在项目的根目录下创建如下内容的文件`package.json`：

```json
{
  "name": "hello_owl",
  "version": "0.1.0",
  "description": "Starting Owl app",
  "main": "src/index.html",
  "scripts": {
    "serve": "serve src"
  },
  "author": "John",
  "license": "ISC",
  "devDependencies": {
    "serve": "^11.3.0"
  }
}
```

我们现在可以使用命令`npm install`安装`serve`工具，然后使用简单的`npm run serve`命令启动一个静态服务器。

## 标准的Javascript项目

上面的项目结构在某些应用场景很有用，比如快速原型。但是，它缺少一些有用的特性，比如热加载，测试套件或者将代码打包在一个文件中。

这些特性和许多其他特性可以通过许多不同的方式实现。由于配置这样的项目确实不是一件简单的事情，所以我们在这里提供一个示例，它可以用作起点。

我们的标准Owl项目有以下文件结构：

```
hello_owl/
  public/
    index.html
  src/
    components/
      App.js
    main.js
  tests/
    components/
      App.test.js
    helpers.js
  .gitignore
  package.json
  webpack.config.js
```

`public` 文件夹包含所有静态资产，如图像和样式，`src` 文件夹包含javascript源代码，最后`tests` 包含测试套件。

下面是`index.html`文件的内容：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Hello Owl</title>
  </head>
  <body></body>
</html>
```

注意到这里没有`<script>`标签，将会被webpack注入，现在让我们看下javascript文件：

```js
// src/components/App.js -------------------------------------------------------
import { Component, tags, useState } from "@odoo/owl";

const { xml } = tags;

export class App extends Component {
  static template = xml`<div t-on-click="update">Hello <t t-esc="state.text"/></div>`;
  state = useState({ text: "Owl" });
  update() {
    this.state.text = this.state.text === "Owl" ? "World" : "Owl";
  }
}

// src/main.js -----------------------------------------------------------------
import { utils, mount } from "@odoo/owl";
import { App } from "./components/App";

function setup() {
  mount(App, { target: document.body });
}

utils.whenReady(setup);

// tests/components/App.test.js ------------------------------------------------
import { App } from "../../src/components/App";
import { makeTestFixture, nextTick, click } from "../helpers";
import { mount } from "@odoo/owl";

let fixture;

beforeEach(() => {
  fixture = makeTestFixture();
});

afterEach(() => {
  fixture.remove();
});

describe("App", () => {
  test("Works as expected...", async () => {
    await mount(App, { target: fixture });
    expect(fixture.innerHTML).toBe("<div>Hello Owl</div>");

    click(fixture, "div");
    await nextTick();
    expect(fixture.innerHTML).toBe("<div>Hello World</div>");
  });
});

// tests/helpers.js ------------------------------------------------------------
import { Component } from "@odoo/owl";
import "regenerator-runtime/runtime";

export async function nextTick() {
  return new Promise(function (resolve) {
    setTimeout(() => Component.scheduler.requestAnimationFrame(() => resolve()));
  });
}

export function makeTestFixture() {
  let fixture = document.createElement("div");
  document.body.appendChild(fixture);
  return fixture;
}

export function click(elem, selector) {
  elem.querySelector(selector).dispatchEvent(new Event("click"));
}
```

最后看看配置文件`.gitignore`, `package.json` 和`webpack.config.js`的内容：

```
node_modules/
package-lock.json
dist/
```

```json
{
  "name": "hello_owl",
  "version": "0.1.0",
  "description": "Demo app",
  "main": "src/index.html",
  "scripts": {
    "test": "jest",
    "build": "webpack --mode production",
    "dev": "webpack-dev-server --mode development"
  },
  "author": "Someone",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.8.4",
    "@babel/plugin-proposal-class-properties": "^7.8.3",
    "babel-jest": "^25.1.0",
    "babel-loader": "^8.0.6",
    "babel-plugin-transform-es2015-modules-commonjs": "^6.26.2",
    "html-webpack-plugin": "^3.2.0",
    "jest": "^25.1.0",
    "regenerator-runtime": "^0.13.3",
    "serve": "^11.3.0",
    "webpack": "^4.41.5",
    "webpack-cli": "^3.3.10",
    "webpack-dev-server": "^3.10.2"
  },
  "dependencies": {
    "@odoo/owl": "^1.0.4"
  },
  "babel": {
    "plugins": ["@babel/plugin-proposal-class-properties"],
    "env": {
      "test": {
        "plugins": ["transform-es2015-modules-commonjs"]
      }
    }
  },
  "jest": {
    "verbose": false,
    "testRegex": "(/tests/.*(test|spec))\\.js?$",
    "moduleFileExtensions": ["js"],
    "transform": {
      "^.+\\.[t|j]sx?$": "babel-jest"
    }
  }
}
```

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const host = process.env.HOST || "localhost";

module.exports = function (env, argv) {
  const mode = argv.mode || "development";
  return {
    mode: mode,
    entry: "./src/main.js",
    output: {
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    devServer: {
      contentBase: path.resolve(__dirname, "public/index.html"),
      compress: true,
      hot: true,
      host,
      port: 3000,
      publicPath: "/",
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(__dirname, "public/index.html"),
      }),
    ],
  };
};
```

有了这个设置，我们现在可以使用以下脚本命令：

```
npm run build # 打包完整的应用到目录dist/

npm run dev # 开启带有热加载的开发服务器

npm run test # 运行jest测试套件
```
