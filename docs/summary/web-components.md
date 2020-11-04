---
title: Web Components概览
description: 本文从整体的概念出发，力求简单而清晰的阐明Web Components这一技术，能对Web Components有个大体上的认识。
date: 2020-05-12
sidebar: 'auto'
tags:
 - 前端
showSponsor: true
---

 Web Components是由Alex Russell在2011年的Fronteers大会上正式提出的，并由谷歌在2013年开始标准化。目前谷歌大约10%的页面都是由Web Components构建的，并且目前几大主流前端框架正在集成Web Components，所以目前学习了解这一项新技术还是很有必要的。

## 什么是Web Components

 Web Components是一组不同的技术的组合，允许您构建可重用、封装和互操作的HTML元素，这些元素可以在Web应用程序中使用跨浏览器使用。总结起来主要是基于以下4个核心技术：

1. Custom Elements;
2. HTML Templates;
3. Shadow DOM;
4. ES Modules.

###  Custom Elements

自定义元素是一组api，它为开发人员提供了扩展HTML元素、构建新元素和定义其行为的方法。基于已经存在的web标准，可以在不同的上下文中使用。

###  HTML Templates

HTML模板是一种声明代码片段的方法，这些代码片段不会在页面加载时呈现，但是可以在运行时使用JavaScript克隆并插入到文档中。Web Components暴露了一个`<template>`元素，可以像这样使用它来包装我们实际的模板代码:

```html
<template>
  <h1>The ultimate guide to Web Components!</h1>
  <p>What do you want to learn about Web Components today?</p>
</template>
```

template元素只是一个占位符，不代表具体的节点。实际上它存储在DocumentFragment中，而不需要浏览上下文(向用户显示对象的环境)，以防止它干扰应用程序的其他部分。这意味着只有在请求时才会呈现模板。

### Shadow DOM

Shadow DOM是一种web标准，它允许您将样式和标记封装在限定作用域的DOM子树中，该子树可以链接到任何HTML元素。封装在Web组件中的限定作用域的DOM子树称为影子树，该树所链接到的组件称为影子宿主。

### ES Modules

ES2015引入了模块的概念，使导出类、函数或任何变量绑定或声明成为可能。你只需要使用导出前缀就可以了。

##  使用Web Components的好处

 一项新的技术产生总归是要解决一些问题，那么引入Web Components是要解决什么问题呢？答案就是解决目前html缺乏的几个问题：**可重用性、可读性、可维护性、可操作性、一致性**，下面分开解释：

### 可重用性

 不管是写代码还日常生活中，DRY(Don’t repeat yourself)原则都是人们所需要的。根据定义，Web组件以最小的依赖进行封装，并提供清晰的API。这使得它们具有极高的可重用性，并且作为开发人员，这提高了我们的生产力。

### 可读性

 关于可读性，我们先来看下面一段代码：

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-header__title">Header title</h3>
    <h4 class="card-header__subtitle">Header subtitle</h4>
  </div>
  <div class="card-body">
    <h3 class="card-body__title">Body title</h3>
    <div class="card-body__content">Lorem ipsum...</div>
  </div>
  <div class="card-footer">
    <div class="card-footer__content">...dolor sit amet</div>
    <button class="card-footer__confirm-button">confirm</button>
    <button class="card-footer__cancel-button">cancel</button>
  </div>
</div>
```

这样的代码看起来是不清楚难以理解的，特别是当正文包含大量文本或自身的HTML结构时。让我们来看一个相同的例子，但是想象一下我们如何使用Web组件来构建它：

```html
<card-component is-confirmable is-cancelable>
  <card-header title="Header title" subtitle="Header subtitle"></card-header>
  <card-body title="Body title">Lorum ipsum...</card-body>
  <card-footer>...dolor sit amet</card-footer>
</card-component>
```

对于人类来说，它更清晰、更容易阅读和理解，因为语义得到了极大的改进，而且所有的HTML都封装在组件中。

###  可维护性

 得益于Web组件的封装特性，应用程序变得更易读和可重用性，代码也更容易debug和维护。并且代码可以分开独立测试，最后再组合在一起形成应用。

### 可操作性

 目前三大主流前端框架都各自有一套自己的组件构建方法和脚手架、生态链，如果用不同的框架开发同样的功能，就需要分别构建，费时费力。而Web Components是浏览器原生支持的特性，你就可以在任何JavaScript应用程序中重用它，它变得更加可读、可维护和可用。跨平台通信只能是一件伟大的事情——特别是在分布式和更大的开发中。

### 一致性

 很多大的项目往往是由不同的项目组开发，并且采用完全不同的技术栈，最后组合在一起，这样会导致应用失去一致性。由于Web组件的可重用性和互操作性，团队不再需要在不同的框架中构建相同的组件，这不仅提高了组件的一致性，还减少了应用程序的大小，提高了可维护性。

##  如何创建一个Web Component

 说了这多，最重要的问题当然是 如何创建一个Web Component了。创建Web Component分为两种情况：一是创建完全新的自定义的组件，而是创建定义内置的元素，也就是扩展现有元素。在创建时有三个原则需要遵循：

1. 同一个自定义元素只能注册一次

2. Web Components标签不能自闭和，自闭和的元素只能是这些元素：`area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`

3. Web Component名字需要包含破折号，以便和内置元素区分开。

###  自定义自己的元素

 自定义自己的元素主要是两个步骤：一是继承HTMLElement这个类，二是CustomElementRegistry.define()注册自定义的组件。还有可选的附加Shadow DOM到组件，和使用`<template>`定义一个HTML模板，并将其克隆附加到组件或组件的Shadow DOM，看下面的例子：

```html
// Create an ES6 class which extends HTMLElement
class AwesomeCardComponent extends HTMLElement {
  constructor() {
    super();
    
    this.innerHTML = this.greeting;
  }
  
  get greeting() {
    return this.getAttribute('greeting');
  }
  
  set greeting(val) {
    if (val) {
      this.setAttribute('greeting', val);
    } else {
      this.removeAttribute('greeting');
    }
  }
}

// Register our awesome card component to the Custom Elements Registry
customElements.define('awesome-card', AwesomeCardComponent);

// Example usage in your app:
<awesome-card greeting="Hello world!"></awesome-card>
```

###  自定义内置元素

 创建Web组件的第二种方法是扩展现有的HTML元素。让我们创建一个扩展HTML原生`<button>`元素的`<awesome-button>`组件。

```js
class AwesomeButtonComponent extends HTMLButtonElement {
  constructor() {
    super();
    
    this.addEventListener('click', () => {
     alert('Great job!');
    });
  }
}
customElements.define('awesome-button', AwesomeButtonComponent, {extends: 'button'});
```

