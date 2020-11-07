---
title: 理解TypeScript
date: 2020-10-28
sidebar: 'auto'
categories:
 - web前端圈
tags:
 - 前端
 - TypeScript
---

随着javascript应用范畴扩展到浏览器之外， 现在被越来越多的应用于后端服务、混合手机应用、云计算、设计神经网络甚至控制机器人。JavaScript的多功能性及其高采用率带来了对可伸缩、安全、高性能和特性丰富的JavaScript应用程序的日益增长的需求。这进而产生了对工具、库和框架的需求，这些工具、库和框架使编写满足这些期望的应用程序变得更容易、更快。
正是这样的需求导致了TypeScript的引入。下面从TypeScript特性，TypeScript设计目标、TypeScript结构组成、安装运行TypeScript几个方面理解TypeScript。

## TypeScript是JavaScript的超集

随着每一个新版本的JavaScript扩展前一个，我们可以把“未来的JavaScript”看作是当前标准的超集。考虑到这个模型，TypeScript被创建来作为JavaScript的超集，将语言的未来交到今天的开发人员手中。此外，TypeScript集成了TC39范围之外的特性，例如类型检查、泛型和接口，这些特性减轻了JavaScript中出现的许多故障点，加快了开发速度——所有这些都是通过JavaScript编写的抽象提供的。

## TypeScript的设计目标

### JavaScript 和 TypeScript的兼容性

任何有效的JavaScript代码都是有效的TypeScript代码，只有几个例外: 处理选项函数参数和为对象文本赋值。但是有效的TypeScript不是有效的JavaScript代码。TypeScript包含JavaScript中不存在的语法和抽象，与JavaScript一起使用会生成JavaScript运行时错误。

### 给JavaScript类型检查

TypeScript被设计成一种强类型语言，在编译到JavaScript的过程中执行静态类型检查。为了灵活性，TypeScript的类型检查功能是可选的; 然而，TypeScript的主要好处是围绕着类型检查——这是使用TypeScript的主要原因! 例如，类型检查允许语言的语言服务层用于创建更好的工具，从而最大化您的生产力，同时减少错误实例。

### 更强大的JavaScript面向对象编程

 TypeScript提供的语法糖将允许我们显著减少代码的占用空间，同时增加代码的表达能力。TypeScript使得编写面向对象的代码变得轻而易举。它为我们提供了类、接口和模块，这些类、接口和模块允许我们在封装的可重用结构中正确地组织我们的代码，使其易于维护和扩展。在类中，我们还可以通过使用TypeScript提供的修饰符(public、private和protected)来指定类属性和方法的可见性级别。这些特性都极大方便了面向对象编程的开发模式。
 零负担
 作为TypeScript开发人员，我们在两种不同的上下文中工作——设计和执行。在设计上下文中，我们直接使用TypeScript来编写应用程序。但是浏览器不能直接执行TypeScript，所以在执行上下文中，我们所有的TypeScript代码都被编译成JavaScript代码，然后由它的目标平台(例如浏览器)执行。TypeScript不受支持的特性只是从编译后的代码中删除—这称为类型擦除。它们的删除不会影响代码的功能，因为这些独特的特性只是为了帮助TypeScript增强开发人员的体验，它们不会超出或覆盖JavaScript语言的核心内容。


## TypeScript核心组件

主要简易介绍TypeScript核心编译器的构成、独立编译器、语言服务层和工具整合。

### TypeScript核心编译器

 TypeScript编译器的核心任务是管理底层的类型检查机制，并将其转换为有效的JavaScript代码。编译器本身是由不同的部分，快速工作在一起，使我们的代码可预测和编译它:

 * 语法分析器
一个安静，复杂但很关键的组件，它接收输入数据，TypeScript源文件，并从中构建数据结构-在这种情况下为抽象语法树。解析我们的代码会创建源的结构化表示，使我们可以检查它们是否遵循语言语法-也就是说，源是使用正确的语法构建的。

* 连接器

当我们有，例如，函数与同名的模块，该连接器链接使用这些符号命名的声明，允许类型系统理解他们

* 类型解析器或类型检查器

该组件为每个构造解析类型，检查语义操作并生成类型诊断。

* 生成器

负责从.ts和d.ts编译输出文件。输出可以是JavaScript文件（.js），TypeScript定义文件（d.ts）或源映射文件（.js.map）。

* 预处理器

使用import或解析和管理文件之间的引用

### TypeScript独立编译器

 独立编译器也被称之为tsc，主要是把.ts文件编译输出为.js文件。

### 语言服务层

 这个组件层位于核心TypeScript编译器的顶部，提供ide和文本编辑器完成工作所需的特性，比如语句完成、签名帮助、代码格式化和概述、语法高亮等等。语言服务还支持代码重构，例如重命名变量、调试和增量编译。

### 工具集成

 TypeScript提供了类型注释，允许ide和文本编辑器对我们的代码执行全面的静态分析。这些注释允许这些工具通过使我们的代码更加可预测来提出明智的建议。作为回报，ide和文本编辑器可以更好地自动完成和重构TypeScript代码。

## 安装运行TypeScript

 可以通过npm或yarn全局安装：

``` shell
npm install -g typescript 或  yarn global add typescript
```

## 使用tsconfig配置TypeScript编译器

 tsconfig.json是用来配置TypeScript编译器如何编译TypeScript项目的各种行为，用下面命令初始化一个TypeScript项目：

 ``` shell
 tsc --init
 ```

  会在项目根目录生成tsconfig.json文件，生成的文件内容比较多，一般不必使用所有这些选项。对于大多数使用TypeScript的应用，下面的一个配置示例就足够了：

  ``` js
  {
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "dist",
    "sourceMap": true,
    "experimentalDecorators": true
  },
  "files": [
    "./node_modules/@types/mocha/index.d.ts",
    "./node_modules/@types/node/index.d.ts"
  ],
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
  ```