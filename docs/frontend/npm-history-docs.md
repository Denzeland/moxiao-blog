---
title: npm history模块文档
description: npm history模块中文文档
date: 2020-10-29
sidebar: 'auto'
categories:
 - web前端
tags:
 - 前端
 - history API
 - 路由
showSponsor: true
---

history是一个管理历史会话的npm包，它抽象出各种环境中的差异，并提供一个最小的API，以管理历史堆栈、导航和持久化会话之间的状态。

## 安装

history模块发布到了[npm](https://www.npmjs.com/)仓库，可以使用npm安装：

``` shell
$ npm install --save history
```

### 使用打包器

使用history模块的最佳方式是使用一个支持JavaScript模块的bundler(建议使用Rollup)。Webpack和Parcel的最新版本也是不错的选择。

然后可以在代码中使用`import`语句，比如下面这样：

```javascript
import { createBrowserHistory } from 'history';
// ...
```

如果使用的打包器不理解JavaScript模块而只理解CommonJS的bundler，你可以使用`require`:

```js
var createBrowserHistory = require('history').createBrowserHistory;
```

### 使用`<script>`标签

如果要在浏览器中使用`<script>`标签加载history库，可以从[unpkg](https://unpkg.com/)加载，如果浏览器支持 [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)，只需要使用构建好的文件`history.production.min.js`

```js
<script type="module">
// Can also use history.development.js in development
import { createBrowserHistory } from 'https://unpkg.com/history/history.production.min.js';
// ...
</script>
```

`history.development.js`可以用于非生产环境的应用。

在还不支持JavaScript模块的浏览器中，可以使用的UMD(全局)构建:

```js
<!-- Can also use history.development.js in development -->
<script src="https://unpkg.com/history/umd/history.production.min.js"></script>
```

库的全局引用为`window.HistoryLibrary`

## 使用指南

history库为运行在浏览器和其他有状态环境中的JavaScript应用程序提供历史跟踪和导航原语，这个库根据使用环境的不同，提供了三种不同的使用方式：

- “browser history”--在现代浏览器中是使用[HTML5 history API](http://diveintohtml5.info/history.html)
- “hash history”-- 如果想当页面重新加载时存储当前URL location的hash部分来避免发送请求到服务器
- “memory history”-- 用于非浏览器环境，比如[React Native](https://facebook.github.io/react-native/)或测试环境

### 基础使用

基本用法如下:

```js
// 创建 history 实例.
import { createBrowserHistory } from 'history';
let history = createBrowserHistory();

// ... 或者仅仅导入history单例.
import history from 'history/browser';

// 如果使用hash history从'history/hash'导入;
// 获取当前的 location.
let location = history.location;

// 监听当前location的变化.
let unlisten = history.listen(({ location, action }) => {
  console.log(action, location.pathname, location.state);
});

// 使用push增加新的条目到历史堆栈.
history.push('/home', { some: 'state' });

// 使用replace来替换堆栈中的当前条目
history.replace('/logged-in');

// 使用back/forward在堆栈中后退/前进.
history.back();

// 如果要停止监听，调用从listen()返回的函数.
unlisten();
```

如果是使用memory history，需要像下面这样获取history对象：

```js
import { createMemoryHistory } from 'history';
let history = createMemoryHistory();
```

如果在一个`window`中使用browser history或hash history，而不是在当前`document`中（比如iframe）,需要像下面这样创建history对象：

```js
import { createBrowserHistory } from 'history';
let history = createBrowserHistory({
  window: iframe.contentWindow
});
```

### 属性

每个`history`对象有下面的属性：

- [`history.location`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#history.location)- 当前的location
- [`history.action`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#history.action)- 当前导航的action

另外`memory history`提供了`history.index`来获取当前历史堆栈的索引

### 监听

可以使用`history.listen`来监听当前location的变化：

```js
history.listen(({ action, location }) => {
  console.log(
    `The current URL is ${location.pathname}${location.search}${location.hash}`
  );
  console.log(`The last navigation action was ${action}`);
});
```

[`location`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#location)对象实现了[`window.location` 接口](https://developer.mozilla.org/en-US/docs/Web/API/Location)的一个子集，包括：

- [`location.pathname`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#location.pathname) - URL的路径
- [`location.search`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#location.search) - URL查询字符串
- [`location.hash`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#location.hash) - URL hash片段
- [`location.state`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#location.state) - 不在URL中存放的当前location附加状态
- [`location.key`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#location.key) - 表示location的唯一字符串

[`action`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#action)是Action.Push`, `Action.Replace`, 或者`Action.Pop三个之一，取决于用户如何到达当前location。

- `Action.Push` means one more entry was added to the history stack
- `Action.Replace` means the current entry in the stack was replaced
- `Action.Pop` means we went to some other location already in the stack

### 清理

`history.listen`会返回一个可以在清理逻辑调用的函数：

```js
let unlisten = history.listen(myListener);

// Later, when you're done...
unlisten();
```

### 工具

history库提供了createPath` 和 `parsePath两个方法用于URL路径：

```js
let pathPieces = parsePath('/the/path?the=query#the-hash');
// pathPieces = {
//   pathname: '/the/path',
//   search: '?the=query',
//   hash: '#the-hash'
// }

let path = createPath(pathPieces);
// path = '/the/path?the=query#the-hash'
```

## 导航

history对象可以使用以下方法以编程方式改变当前位置:

- [`history.push(to: To, state?: State)`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#history.push)
- [`history.replace(to: To, state?: State)`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#history.replace)
- [`history.go(delta: number)`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#history.go)
- [`history.goBack()`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#history.back)
- [`history.goForward()`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#history.forward)

下面有例子：

```js
// Push a new entry onto the history stack.
history.push('/home');

// Push a new entry onto the history stack with a query string
// and some state. Location state does not appear in the URL.
history.push('/home?the=query', { some: 'state' });

// If you prefer, use a location-like object to specify the URL.
// This is equivalent to the example above.
history.push({
  pathname: '/home',
  search: '?the=query'
}, {
  some: state
});

// Go back to the previous history entry. The following
// two lines are synonymous.
history.go(-1);
history.goBack();
```

## 阻塞导航

使用[`history.block(blocker: Blocker)`](https://github.com/ReactTraining/history/blob/28c89f4091ae9e1b0001341ea60c629674e83627/docs/api-reference.md#history.block)API可以阻止导航离开当前页面，使用这个功能可以确保用户知道，如果他们离开当前页面，他们将丢失一些未保存的更改。

```js
// 阻塞导航并注册回调函数
let unblock = history.block(tx => {
  // 导航被阻塞了，可以显示一个弹框，让用户决定是否继续
  let url = tx.location.pathname;
  if (window.confirm(`Are you sure you want to go to ${url}?`)) {
    // 取消阻塞导航
    unblock();
    tx.retry();
  }
});
```

