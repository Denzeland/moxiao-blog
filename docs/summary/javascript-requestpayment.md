---
title: Javascript支付请求API
description: 本文介绍一个新的web API-Payment Request API，介绍了什么是Payment Request API，目标是什么和基本的使用方法。
date: 2020-05-13
sidebar: 'auto'
tags:
 - javascript
 - 前端
showSponsor: true
---

在传统的支付流程中，我们首次在网站结算时，比如信用卡支付的场景，往往要填写卡号，到期时间，身份信息， 收货地址等信息，而且不同的网站都需要重复输入这些信息， 这是很繁琐的， 可能用户因为没有带卡在身上无法填写信息而放弃支付。Javascript支付请求API（Payment Request API）正是为了解决这个问题而提出的。

##  什么是Javascript支付请求API？

 总结起来，支付请求API就是允许浏览器作为交易三方（用户，收款方，支付方式）之间的中介。它的目的是让浏览器重用存储的支付和地址信息，从而简化付款过程，使用支付请求API，有下面三个好处：

* **快速购买体验**: 浏览器会记住用户的详细信息，他们不再需要为不同的网站填写相同的信息
* **一致的用户体验**: UI由浏览器控制，使其始终保持一致
* **凭证管理**: 用户可以直接在浏览器中更改他们的送货地址和卡片详细信息。这些详细信息可以同步到其他设备，如手机和平板电脑!

## 支付请求API目标是什么

 从[W3C官方文档](https://www.w3.org/TR/payment-request/)描述的，支付请求API的目标主要是：

* 允许浏览器充当商家、用户和支付方法之间的中介
* 轻松支持不同的安全支付方式
* 尽可能使沟通流程标准化
* 最终支持任何设备上的所有浏览器

##  支付请求API基础用法

使用PaymentRequest API，我们需要创建一个`PaymentRequest`对象。这个对象是在用户点击购买的时候创建的，`PaymentRequest`对象的作用就是允许网站使用浏览器传递用户提供的交易信息，使用`PaymentRequest()`构造函数创建：

```js
const paymentObject = new PaymentRequest(methodData, details, options);
```

三个参数解释：
* `methodData`：这是网站接受的支付方式的对象数组，它决定了用户将如何为他的产品付费。例如：
```js
[
  {
    supportedMethods: "basic-card",
    data: {
      supportedNetworks: ["visa", "mastercard"],
      supportedTypes: ["debit", "credit"]
    }
  }
]
```
supportedMethods字段是一个单独的DOMString，根据值的不同，data的含义也不同，更多信息可以参考[W3C](https://www.w3.org/TR/payment-request/#dom-paymentmethoddata)和[MDN](https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/PaymentRequest)

* `details`：这是一个JavaScript对象，它包含关于特定支付的信息。这包括总付款金额、运费、税金等。例如：

```js
{
    id: item.id,
    displayItems: [
      {
        label: item.label,
        amount: {
          currency: "AUD",
          value: item.amount
        }
      }
    ],
    total: {
      label: "Total",
      amount: {
        currency: "AUD",
        value: item.amount
      }
    }
  }
```

  字段的解释：
     `total`： 这是付款请求的总价
    `displayItem`: 浏览器可能显示的可选项目的数组。这不仅限于物品的价格;它可以包括税、运费和其他。
    `Id`： 支付请求上的标识符，这是可选的，如果没有提供，浏览器将创建一个。
    
更多选项，比如`shippingOptions`可以参考[MDN](https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/PaymentRequest)

* `options`(可选)：这是一个JavaScript对象，允许您控制浏览器的行为，以便从用户捕获什么。这个参数比较简单，例如：

```js
const options = {
  requestPayerName: true,
  requestPayerEmail: true,
  requestPayerPhone: true,
  requestShipping: false,
  shippingType: 'shipping'
};
```

下面看下这些字段：
`requestPayerName`：一个布尔值，指示浏览器是否应该收集付款人的姓名并与付款请求一起提交
`requestPayerEmail`： 一个布尔值，指示浏览器是否应该收集付款人的电子邮件并与付款请求一起提交。
`requestPayerPhone`： 指示浏览器是否应该收集付款人的电话号码并与付款请求一起提交的布尔值。
`requestShipping`： 一个布尔值，指示浏览器是否应该收集用户的送货地址并与付款请求一起提交。如果将其设置为true，则应该设置适当的`shippingType`
`shippingType`： 让您决定UI如何展示发货信息。

下面看一下用户点击立即购买按钮，使用支付请求API触发函数的例子：

```js
async function buyItem(item) {
  const paymentMethods = [
    {
      supportedMethods: "basic-card",
      data: {
        supportedNetworks: ["visa", "mastercard"],
        supportedTypes: ["debit", "credit"]
      }
    }
  ];
  try {
    const paymentObject = buildShoppingCart(item);
    const payment = new PaymentRequest(paymentMethods, paymentObject, options);
    // Show the UI
    const paymentUi = await payment.show();
    //If payment is successful, run here
    await paymentUi.complete("success");
  } catch (e) {
    console.log("e", e);
    return;
  }
}
```

调用show()方法后返回一个promise。如果成功，它将返回一个PaymentResponse对象，在我们的示例中称为paymentUi。在这里我们调用paymentUi.complete()来完成用户交互，在这之后可以处理接下来用户的支付流程，比如重定向到另一个页面。

下面是一个比较具体的例子：

<iframe
     src="https://codesandbox.io/embed/practical-monad-8ty2j?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="practical-monad-8ty2j"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>