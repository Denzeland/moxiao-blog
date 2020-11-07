---
title: DOM元素尺寸获取和形变关系
description: 主要对各种使用JavaScript来获取DOM元素的尺寸的方法和属性做了一个简要的介绍，理解这些获取宽高方式的区别有助于在实际开发中不至于混乱
date: 2020-05-14
sidebar: 'auto'
categories:
 - web前端圈
tags:
 - javascript
 - 前端
---

 使用JavaScript来获取DOM元素的尺寸主要是有下面的方法和元素的属性：

*  `getBoundingClientRect()`方法返回对象的`width` 和 `height`属性: 元素实际渲染的宽高
*  `offsetWidth` 和 `offsetHeight`：返回元素的布局宽高
*  `window.getComputedStyle()`：返回元素计算样式表，当元素样式改变时，返回的值实时反映样式表
*  `document.styleSheets`：返回一个所有当前可用样式表集的实时列表。
*  `scrollWidth` 和 `scrollHeight`：内容区域的实际大小
*  `clientWidth` 和 `clientHeight`：元素可视区域宽高，包括内边距但是不包括边框、外边距或者滚动条
上面的这些方法和属性的工作方式不一样，因此它们不会给出相同的结果。你可以看到不同的宽度和高度值查看以下演示:

<iframe height="265" style="width: 100%;" scrolling="no" title="Different Ways to Get Width/Height Values with DOM Scripting" src="https://codepen.io/impressivewebs/embed/WWjNvz?height=265&theme-id=dark&default-tab=js,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/impressivewebs/pen/WWjNvz'>Different Ways to Get Width/Height Values with DOM Scripting</a> by Louis Lazaris
  (<a href='https://codepen.io/impressivewebs'>@impressivewebs</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

 下面主要说明在应用了CSS tr*ansform属性后，***`offsetWidth`** 、 **`offsetHeight` 和getBoundingClientRect()返回的元素的宽高的区别，下面看一个例子：

<iframe height="265" style="width: 100%;" scrolling="no" title="Dimensions of Elements with Transforms vs. Elements without Transforms" src="https://codepen.io/impressivewebs/embed/BgNWMq?height=265&theme-id=dark&default-tab=js,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/impressivewebs/pen/BgNWMq'>Dimensions of Elements with Transforms vs. Elements without Transforms</a> by Louis Lazaris
  (<a href='https://codepen.io/impressivewebs'>@impressivewebs</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

 总结起来就是当元素的形状发生变化时，offsetWidth和offsetHeight始终回元素的布局宽高，不会随着形状变化而变化， 而getBoundingClientRect()返回实际渲染的宽高。

> 有一点需要注意，实际渲染的宽高的计算对于非矩形形状的元素，计算基于一个假想的盒子，这个盒子是在元素处于转换状态时根据元素到达的最远距离创建的，如图：

![](http://qn.zdctech.top/202005/new-dimensions.png)

 当应用了3D形变时， 也是一样的：

<iframe height="265" style="width: 100%;" scrolling="no" title="Dimensions of Elements with 3D Transforms Applied" src="https://codepen.io/impressivewebs/embed/dBoePG?height=265&theme-id=dark&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/impressivewebs/pen/dBoePG'>Dimensions of Elements with 3D Transforms Applied</a> by Louis Lazaris
  (<a href='https://codepen.io/impressivewebs'>@impressivewebs</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>