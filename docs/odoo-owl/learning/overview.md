---
description: 本文是对odoo官方开发的前端MVVM框架OWL的快速预览教程文档的中文翻译
date: 2020-12-10
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - odoo
 - owl
---

# 🦉 快速预览 🦉

应用程序中的Owl组件用于定义(动态)组件树。

```
        Root
        /   \
       A     B
      / \
     C   D
```

**State:** 每个组件都可以管理自己的本地状态。它是一个简单的ES6 class，没有特殊的规则:

```js
class Counter extends Component {
  static template = xml`
    <button t-on-click="increment">
      Click Me! [<t t-esc="state.value"/>]
    </button>`;

  state = { value: 0 };

  increment() {
    this.state.value++;
    this.render();
  }
}
```

上面的例子向我们展示了一个带有state的组件，注意到`state` 就是一个普通的对象, 当状态更新时，我们需要手动调用 `render`函数。这很快就会变得很烦人(如果我们做得太多，效率就会降低)。有一个更好的方法:使用`useState`钩子，它将一个对象转换为自身的响应式版本:

```js
const { useState } = owl.hooks;

class Counter extends Component {
  static template = xml`
    <button t-on-click="increment">
      Click Me! [<t t-esc="state.value"/>]
    </button>`;

  state = useState({ value: 0 });

  increment() {
    this.state.value++;
  }
}
```

注意`t-on-click` 处理程序可以使用内联语句：

```xml
    <button t-on-click="state.value++">
```

**Props:** 子组件通常需要从父组件获取信息， 这可以通过向模板添加所需信息来实现。子组件可以通过`props`对象来访问这些信息。注意这里有一个重要的规则：`props` 对象中包含的信息不属于子组件，并且永远不应该被修改。

```js
class Child extends Component {
  static template = xml`<div>Hello <t t-esc="props.name"/></div>`;
}

class Parent extends Component {
  static template = xml`
    <div>
        <Child name="'Owl'" />
        <Child name="'Framework'" />
    </div>`;
  static components = { Child };
}
```

**Communication:** 有多种方式在组件间通信，最重要的是下面两种方式：

- 从父组件到子组件: 通过使用 `props`,
- 从子组件到父组件: 通过触发事件

下面的例子演示了这两种机制：

```js
class OrderLine extends Component {
  static template = xml`
    <div t-on-click="add">
        <div><t t-esc="props.line.name"/></div>
        <div>Quantity: <t t-esc="props.line.quantity"/></div>
    </div>`;

  add() {
    this.trigger("add-to-order", { line: this.props.line });
  }
}

class Parent extends Component {
  static template = xml`
    <div t-on-add-to-order="addToOrder">
        <OrderLine
            t-foreach="orders"
            t-as="line"
            line="line" />
    </div>`;
  static components = { OrderLine };
  orders = useState([
    { id: 1, name: "Coffee", quantity: 0 },
    { id: 2, name: "Tea", quantity: 0 },
  ]);

  addToOrder(event) {
    const line = event.detail.line;
    line.quantity++;
  }
}
```

在上面的例子中, `OrderLine`组件触发`add-to-order` 事件。 这将生成一个DOM事件，它将沿着DOM树冒泡。它将被父组件拦截，然后父组件将获得该数据(从`detail`键)，然后增加其数量。有关事件如何工作的详细信息，请参阅[事件处理](../reference/event_handling.md)页面。 

注意到在这个例子中如果`OrderLine` 组件直接修改`line` 对象，这个示例也可以工作。然而这是不好的做法，这样能工作的原因是子组件接收的`props` 对象是响应式的，子组件然后耦合到父组件实现。