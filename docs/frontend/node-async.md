---
title: node异步实现的方式和异步流程控制
description: node异步实现的方式和异步流程控制
date: 2020-05-10
sidebar: 'auto'
categories:
 - web前端圈
tags:
 - node.js
 - 前端
---

node中的异步实现主要有两种方式，回调函数和事件发射器。回调函数处理一次性事件，事件发射器可以处理重复性事件。在异步程序的执行过程中，有些任务可能会随时发生，跟程序中的其他部分在做什么没关系，什么时候做这些任务都不会出问题。但也有些任务只能在某些特定的任务之前或之后做。让一组异步任务顺序执行的概念被Node社区称为流程控制。下面看这两个异步实现和流程控制：

## 回调函数

一次性的动作要靠注册回调函数来执行，下面是一个回调函数实现http服务器的例子：

```js
const http = require('http'); 
const fs = require('fs'); 
http.createServer((req, res) => {

    if (req.url == '/') {
        fs.readFile('./titles.json', (err, data) => {
            if (err) {
            console.error(err); 
            res.end('Server Error'); 
            } else {
                const titles = JSON.parse(data.toString()); 
                fs.readFile('./template.html', (err, data) => {
                    if (err) {
                        console.error(err); 
                        res.end('Server Error'); 
                    } else {
                        const tmpl = data.toString(); 
                        const html = tmpl.replace('%', titles.join('</li><li>')); 
                        res.writeHead(200, { 'Content-Type': 'text/html' }); 
                        res.end(html); 
                    }
                });
            }
        });
    }

}).listen(8000, '127.0.0.1'); 
```

## 事件发射器

事件发射器主要是利用events模块的EventEmitter构造函数，实现发布订阅模式

```js
const EventEmitter = require('events'). EventEmitter; 
const channel = new EventEmitter(); 

    channel.on('join', () => {
    console.log('Welcome!'); 

}); 
```

## 异步的流程控制

异步的流程控制分为两类：串行和并行。需要一个接着一个执行的任务叫作串行任务，不需要一个接着一个执行的任务叫作并行任务。

可以用回调嵌套的方法实现或者用工具模块实现（如async模块）实现串行任务，并行任务可以用队列实现。下面是一个利用async模块实现的既有串行任务也有并行任务的同时下载文件的示例：

```js
const exec = require('child_process').exec; 
function downloadNodeVersion(version, destination, callback) {
const url = `http://nodejs.org/dist/v${version}/node-v${version}.tar.gz` ; 
const filepath = `${destination}/${version}.tgz` ; 
exec( `curl ${url} > ${filepath}` , callback); 
}
async.series([
callback => {
async.parallel([
callback => {
console.log('Downloading Node v4.4.7...'); 
downloadNodeVersion('4.4.7', '/tmp', callback); 
}, 
callback => {
console.log('Downloading Node v6.3.0...'); 
downloadNodeVersion('6.3.0', '/tmp', callback); 
}
], callback); 
}, 
callback => {
console.log('Creating archive of downloaded files...'); 
exec(
'tar cvf node_distros.tar /tmp/4.4.7.tgz /tmp/6.3.0.tgz', 
err => {
if (err) throw err; 
console.log('All done!'); 
callback(); 
}
); 
}
]); 
```