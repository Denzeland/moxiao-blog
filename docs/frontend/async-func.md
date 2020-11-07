---
title: async函数 - 提高 Promise 的易用性
description: ES6新增的异步控制语法async函数的基本使用和原理
categories:
 - web前端圈
date: 2020-05-10
sidebar: 'auto'
tags:
 - javascript
 - 前端
---

如果在函数定义之前使用了 `async` 关键字，就可以在函数内使用 await，可以利用它们像编写同步代码那样编写基于 Promise 的代码，而且还不会阻塞主线程。当 `await` 某个 Promise 时，函数暂停执行，直至该 Promise 产生结果，并且暂停并不会阻塞主线程。 如果 Promise 执行，则会返回值。 如果 Promise 拒绝，则会抛出拒绝的值，如下基本写法：

```js
async function myFirstAsyncFunction() { 
    try { const fulfilledValue = await promise; } 
    catch (rejectedValue) { 
        // 
     … } 
}
```

假设我们想获取某个网址并以文本形式记录响应日志。以下是利用 Promise 编写的代码：

```js
function logFetch(url) {
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      console.log(text);
    }).catch(err => {
      console.error('fetch failed', err);
    });
}
```

以下是利用异步函数具有相同作用的代码：

```js
async function logFetch(url) {
  try {
    const response = await fetch(url);
    console.log(await response.text());
  }
  catch (err) {
    console.log('fetch failed', err);
  }
}
```

代码行数虽然相同，但去掉了所有回调。这可以提高代码的可读性，对不太熟悉 Promise 的人而言，帮助就更大了。

> **`await`** 的任何内容都通过 **`Promise.resolve()`** 传递，这样您就可以安全地 **`await`** 非原生 Promise。

## async函数返回值

无论是否使用 `await`，异步函数**都会**返回 Promise。该 Promise 解析时返回异步函数返回的任何值，拒绝时返回异步函数抛出的任何值。

因此，对于：

```js
// wait ms milliseconds
function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function hello() {
  await wait(500);
  return 'world';
}
```

调用 `hello()` 返回的 Promise 会在**执行**时返回 `"world"`。

```js
async function foo() {
  await wait(500);
  throw Error('bar');
}
```

调用 `foo()` 返回的 Promise 会在**拒绝**时返回 `Error('bar')`。

## 其他async函数语法

除了async function() {}，async还能用于其他地方的函数：

### 箭头函数

 例如下面的promise数组例子：

```js
// map some URLs to json-promises
const jsonPromises = urls.map(async url => {
  const response = await fetch(url);
  return response.json();
});
```

> **`array.map(func)`** 不在乎我提供给它的是不是异步函数，只把它当作一个返回 Promise 的函数来看待。 它不会等到第一个函数执行完毕就会调用第二个函数。

### 对象方法

```js
const storage = {
  async getAvatar(name) {
    const cache = await caches.open('avatars');
    return cache.match(`/avatars/${name}.jpg`);
  }
};

storage.getAvatar('jaffathecake').then(…);
```

### 类方法

```js
class Storage {
  constructor() {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

const storage = new Storage();
storage.getAvatar('jaffathecake').then(…);
```

##  并行执行

 因为执行async函数时遇到await关键字会暂停后面的代码执行，如果要提高执行效率，可以同时执行函数内的多个await，达到并行执行效果：

```js
async function series() {
  await wait(500);
  await wait(500);
  return "done!";
}
```

以上代码执行完毕需要 1000 毫秒，再看看这段代码：

```js
async function parallel() {
  const wait1 = wait(500);
  const wait2 = wait(500);
  await wait1;
  await wait2;
  return "done!";
}
```

以上代码只需 500 毫秒就可执行完毕，因为两个 wait 是同时发生的

 再看一个例子：

```js
async function logInOrder(urls) {
  // fetch all the URLs in parallel
  const textPromises = urls.map(async url => {
    const response = await fetch(url);
    return response.text();
  });

  // log them in sequence
  for (const textPromise of textPromises) {
    console.log(await textPromise);
  }
}
```

