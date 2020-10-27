---
title: Cache API
date: 2020-10-27
sidebar: auto
categories:
 - web前端
tags:
 - 前端
 - Cache API
showSponsor: true
---

ServiceWorker API给了开发人员对浏览器缓存更多的控制，虽然Etag也能实现缓存效果，但是用JavaScript代码控制缓存可以有更大的灵活性，可以控制什么应该缓存，什么不应该缓存，达到更好的离线使用效果。当然使用Cache API控制缓存，也意味着必须自己做清理工作。下面具体看看缓存添加、获取、删除的操作；

## 检测浏览器是否支持Cache API

```js
if('caches' in window) {
  // Has support!
}
```

::: tip
判断浏览器是否支持缓存， 就是看有没有caches这个对象
:::

##  创建缓存

创建缓存需要调用caches.open方法， 传入缓存名称：

```js
caches.open('test-cache').then(function(cache) {
  // Cache is created and accessible
});
```

 caches.open方法返回promise对象，参数cache是新建的缓存对象或者是open方法调用前存在的缓存对象。

 ##  添加缓存

 可以把缓存想象成是作为被浏览器缓存的响应对象（Response）的键值Request对象数组，主要是两个方法，add和addAll，参数是应该被请求并缓存的url字符串或者是Request对象。

 要一次添加多个URL缓存，可以使用addAll方法：

```js
 caches.open('test-cache').then(function(cache) { 
  cache.addAll(['/', '/images/logo.png'])
    .then(function() { 
      // Cached!
    });
});
```
要添加单个url缓存，可以使用add方法：

```js
caches.open('test-cache').then(function(cache) {
  cache.add('/page/1');  // "/page/1" URL will be fetched and cached!
});
```
也支持自定义Request对象：

```js
caches.open('test-cache').then(function(cache) {
  cache.add(new Request('/page/1', { /* request options */ }));
});
```

和add方法类似，put方法可以用来添加url及对应的response对象：

```js
fetch('/page/1').then(function(response) {
  return caches.open('test-cache').then(function(cache) {
    return cache.put('/page/1', response);
  });
});
```
## 获取缓存的Request及对应的Response

 查看被缓存的Request，可以用keys方法遍历：

 ```js
 caches.open('test-cache').then(function(cache) { 
  cache.keys().then(function(cachedRequests) { 
    console.log(cachedRequests); // [Request, Request]
  });
});

/*
Request {
  bodyUsed: false
  credentials: "omit"
  headers: Headers
  integrity: ""
  method: "GET"
  mode: "no-cors"
  redirect: "follow"
  referrer: ""
  url: "https://fullhost.tld/images/logo.png"
}
*/
```

 要查看对应的Response对象可以调用cache.match或者cache.matchAll：

 ```js
 caches.open('test-cache').then(function(cache) {
  cache.match('/page/1').then(function(matchedResponse) {
    console.log(matchedResponse);
  });
});

/*
Response {
  body: (...),
  bodyUsed: false,
  headers: Headers,
  ok: true,
  status: 200,
  statusText: "OK",
  type: "basic",
  url: "https://davidwalsh.name/page/1"
}
```
##  删除缓存的Request

使用delete方法：

```js
caches.open('test-cache').then(function(cache) {
  cache.delete('/page/1');
});
```
## 获取存在的缓存名称

要获取已经存在的缓存名称，使用caches.keys：

```js
caches.keys().then(function(cacheKeys) { 
  console.log(cacheKeys); // ex: ["test-cache"]
});
```

## 删除一个缓存

 调用caches.delete传入缓存名称

 ```js
 caches.delete('test-cache').then(function() { 
  console.log('Cache successfully deleted!'); 
});
```

当用新的缓存替换时经常会删除缓存（会触发重新安装新的service worker）:

```js
// Assuming `CACHE_NAME` is the newest name
// Time to clean up the old!
var CACHE_NAME = 'version-8';

// ...

caches.keys().then(function(cacheNames) {
  return Promise.all(
    cacheNames.map(function(cacheName) {
      if(cacheName != CACHE_NAME) {
        return caches.delete(cacheName);
      }
    })
  );
});
```