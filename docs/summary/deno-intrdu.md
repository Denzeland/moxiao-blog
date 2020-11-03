---
title: Deno 1.0我们需要了解的
description: Deno 1.0最终版本即将发布，本文是对Deno的一个整体上比较全面的介绍，从安全到标准库，第三方库等，包管理等都做了介绍，能对Deno有个整体的认识。
date: 2020-05-12
sidebar: 'auto'
tags:
 - node.js
 - 前端
showSponsor: true
---

Deno是一个JavaScript/TypeScript运行环境，由[Node.js](https://blog.logrocket.com/node-js-12/)创造者Ryan Dahl在2018年开发的一个项目，项目的起因也是来自于他自己所说的[关于Node.js我后悔的10件事](https://www.youtube.com/watch?v=M3BM9TB-8yA)。区别于Node.js底层采用C++语言，Deno内核采用Rust语言编写，事件循环采用Rust实现的[Tokio](https://tokio.rs/)，以及用来解释执行JavaScript的V8引擎，并且内置TypeScript支持。经过近两年的等待，目前1.0版本的API已经冻结，官方预计在5月13日发布。

# 开始入门
关于Deno的下载安装，可以参照官网首页的安装方式，升级到最新版，可以使用命令`deno upgrade`
要获得某个子命令的使用方式，有如下两个命令：
* deno [subcommand] -h：获得子命令的概要
* deno [subcommand] --help：获得详细使用信息
# 安全
Deno在默认情况下是安全的。相比之下，Node.js可以完全访问您的文件系统和网络。若要运行没有权限的程序，请使用:
`deno run file-needing-to-run-a-subprocess.ts`
如果代码需要权限设置的话，会产生一个警告：
`error: Uncaught PermissionDenied: access to run a subprocess, run again with the --allow-run flag`

Deno使用命令行选项显式地允许访问系统的不同部分。最常用的包括:
* 系统环境的访问
* 网络访问
* 文件系统读写访问
* 运行子进程
要更详细的设置特定的权限操作，可以使用权限白名单，例如下面的例子让Deno只读/etc目录：
`deno --allow-read=/etc`

# 使用权限的快捷方式
在每次运行应用程序时显式启用权限是一个很麻烦的事情，要解决这个问题，可以采用以下任何一种方法。

## 1. 允许所有权限
使用选项`--allow-all`或者`-A`来启用允许所有操作的权限，但不推荐，这会使得特定安全限制被取消

## 2. 创建bash脚本
在bash脚本里写明所需最小权限集合，例如下面的例子：
```js
#!/bin/bash

// Allow running subprocesses and file system write access
deno run --allow-run --allow-write mod.ts
```

## 使用任务运行器
可以使用GNU工具make创建一个文件，其中包含一组带有权限的Deno命令。您还可以使用特定于deno的版本[Drake](https://deno.land/x/drake/)。

## 安装可执行Deno程序
可以使用`deno install`[安装Deno程序](https://deno.land/std/manual.md#installing-executable-scripts)，安装的程序是具有需要的权限的，安装后，可以从$PATH中的任何位置访问程序。

# 标准库
官方维护了一套[标准库](https://deno.land/std/)，包含用户执行常见任务的库，下面列举了一些Deno标准库和相应的实现相同功能的npm包：

|                       Deno模块                       |                           描述                            | 对应npm包                    |
| :--------------------------------------------------: | :-------------------------------------------------------: | ---------------------------- |
|     [color](https://deno.land/std/fmt/colors.ts)     |                      添加颜色到终端                       | **chalk, kleur, and colors** |
| [datetime](https://deno.land/std/datetime/README.md) |               帮助处理JavaScript `Date`对象               |                              |
| [encoding](https://deno.land/std/encoding/README.md) | 增加对外部数据位的支持，如base32、二进制、csv、toml和yaml |                              |
|    [flags](https://deno.land/std/flags/README.md)    |                    帮助处理命令行参数                     | **minimist**                 |
|       [fs](https://deno.land/std/fs/README.md)       |                     帮助操作文件系统                      |                              |
|     [http](https://deno.land/std/http/README.md)     |                 允许通过HTTP服务本地文件                  | **http-server**              |
|      [log](https://deno.land/std/log/README.md)      |                       用于创建日志                        | **winston**                  |
|  [testing](https://deno.land/std/testing/README.md)  |               用于单元测试、断言和基准测试                | **chai**                     |
|     [uuid](https://deno.land/std/uuid/README.md)     |                        UUID生成器                         | **uuid**                     |
|       [ws](https://deno.land/std/ws/README.md)       |              帮助创建WebSocket客户端/服务器               | **ws**                       |


# Deno内置Typescript支持
要在Deno中使用TypeScript，不需要做任何事情。如果没有Deno, TypeScript必须编译成JavaScript才能运行。Deno在内部会为你编译，使TypeScript更容易被接受。Deno有默认的`tsconfig.json`配置，你也可以使用自己的配置覆盖默认的配置：

`deno run -c tsconfig.json [file-to-run.ts]`

# Deno尽可能使用web标准
在web开发领域，必定要学习很多web api的使用，很多JavaScript能用的API，在Node.js中就不支持，比如`fetch` api,在Node.js中需要第三方包[Node Fetch](https://github.com/node-fetch/node-fetch)。Deno 1.0提供了以下与web兼容的api。
* addEventListener
* atob
* btoa
* clearInterval
* clearTimeout
* dispatchEvent
* fetch
* queueMicrotask
* removeEventListener
* setInterval
* setTimeout
* AbortSignal
* Blob
* File
* FormData
* Headers
* ReadableStream
* Request
* Response
* URL
* URLSearchParams
* console
* isConsoleInstance
* location
* onload
* onunload
* self
* window
* AbortController
* CustomEvent
* DOMException
* ErrorEvent
* Event
* EventTarget
* MessageEvent
* TextDecoder
* TextEncoder
* Worker
* ImportMeta
* Location
这些API都在全局可用。

# ES6模块
Deno使用官方的ECMAScript模块标准，而不是遗留的CommonJS。Node.js直到2019年的版本13.2.0才支持ECMAScript模块。但是支持是半成品，它仍然包括有争议的.mjs文件扩展名。Deno在其模块系统中使用了现代web标准，从而摆脱了过去的束缚。使用URL或文件路径引用模块，并包含一个强制文件扩展名。例如:

```js
import * as log from "https://deno.land/std/log/mod.ts";
import { outputToConsole } from "./view.ts";
```

# 包管理
不同于Node.js采用的是集中式的三方包存储仓库，它不是依赖于一个中央存储库，而是分散的。任何人都可以托管包，就像任何人都可以托管web上的任何类型的文件一样。引入包可以直接从URL导入，例如：
`import { assertEquals } from "https://deno.land/std/testing/asserts.ts";`

没有集中的包管理器，可以直接从web导入所需要的包。没有`node_modules`目录，相反，依赖项被下载并隐藏在你的硬盘上，看不见。如果您想刷新缓存并再次下载它们，只需添加`——reload`到命令。


## 寻找第三方兼容的包

Deno首页有一个[第三方包的仓库](https://deno.land/x/)，除了这里列出的之外，还可以在 [jspm.io](https://jspm.io/)上面找到可以运行在Deno上的包，上面现有的能在浏览器上运行的基于ES6模块的包基本可以运行，使用CommonJS语法的可以用ESM语法封装模块来使用，但是使用Node.js API的模块一般无法使用。首先推荐从[Pika](https://www.pika.dev/cdn)上面搜索兼容的第三方包，然后再是标准库和Deno的用户库。