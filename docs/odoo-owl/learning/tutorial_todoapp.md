---
description: 本文是对odoo官方开发的前端MVVM框架OWL的TodoList教程文档的中文翻译
date: 2020-12-09
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - odoo
 - owl
---

# 🦉 OWL 教程: 创建一个TodoList应用 🦉

在这个教程里，我们将构建一个非常简单的Todo list应用，这个应用应当满足下面的要求：

- 用户可以创建并删除任务
- 任务可以被标记为已完成
- 可以过滤任务展示进行中/已完成任务

这个项目将是一个发现和学习一些重要的Owl概念的机会，比如组件、状态管理以及如何组织应用程序。

## 目录

1. [初始化项目](#_1-初始化项目)
2. [添加第一个组件](#_2-添加第一个组件)
3. [展示任务列表](#_3-展示任务列表)
4. [布局: 一些基础的样式](#_4-布局-一些基础的样式)
5. [提取Task作为子组件](#_5-提取Task作为子组件)
6. [添加任务(part 1)](#_6-添加任务-part-1)
7. [添加任务(part 2)](#_7-添加任务-part-2)
8. [切换任务](#_8-切换任务)
9. [删除任务](#_9-删除任务)
10. [使用store API](#_10-使用store-api)
11. [保存任务到local storage](#_11-保存任务到local-storage)
12. [过滤任务](#_12-过滤任务)
13. [最后让任务可点击](#_13-最后让任务可点击)
14. [最终代码](#_14-最终代码)

## 1. 初始化项目

对于本教程，我们将做一个非常简单的项目，只使用静态文件，不使用其他工具。第一步是创建以下文件结构:

```
todoapp/
    index.html
    app.css
    app.js
    owl.js
```

这个应用的入口文件是`index.html`, 其中应包括以下内容:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OWL Todo App</title>
    <link rel="stylesheet" href="app.css" />
    <script src="owl.js"></script>
    <script src="app.js"></script>
  </head>
  <body></body>
</html>
```

 `app.css` 目前暂时留空，这个文件后面为我们的应用定义样式。 `app.js` 是我们写代码的地方，现在添加以下代码：

```js
(function () {
  console.log("hello owl", owl.__info__.version);
})();
```

注意，我们将所有内容都放在一个立即执行的函数中，以避免泄漏任何东西到全局范围。

最后, `owl.js` 应该是从Owl存储库下载的最后一个版本 (如果你喜欢，你可以使用`owl.min.js`).

现在，项目应该准备好了。 用浏览器加载 `index.html` 文件应该会显示一个带有标题 `Owl Todo App`的空白页面, 并且在控制台打印一个消息 `hello owl 1.0.0` 。

## 2. 添加第一个组件

Owl应用程序由 [组件](../reference/component.md)组成,  只有一个根组件。让我们从定义一个`App` 组件开始，用以下代码替换app.js中函数的内容:

```js
const { Component, mount } = owl;
const { xml } = owl.tags;
const { whenReady } = owl.utils;

// Owl组件
class App extends Component {
  static template = xml`<div>todo app</div>`;
}

// 初始化代码
function setup() {
  mount(App, { target: document.body });
}

whenReady(setup);
```

现在，在浏览器中重新加载页面应该会显示一条消息。

代码相当简单，但是让我们更详细地解释最后一行。 浏览器会尝试尽快执行`app.js`中的代码，当我们尝试挂载`App`组件时，可能会发生DOM还没有准备好的情况。为了避免这种情况，我们使用 [`whenReady`](../reference/utils.md#whenready)助手来延迟`setup` 函数的执行，直到DOM准备好。

备注1: 在较大的项目中，我们将代码分割成多个文件，在子文件夹中定义组件，主文件将初始化应用程序。然而，这是一个非常小的项目，我们想让它尽可能简单。

备注2: 本教程使用静态类字段语法。目前不是所有浏览器都支持这个特性。大多数真实的项目将转换他们的代码，所以这不是一个问题，但对于本教程，如果你需要代码在每个浏览器都工作，你需要将`static` 关键字转化为直接挂载到类：

```js
class App extends Component {}
App.template = xml`<div>todo app</div>`;
```

备注3: 使用[`xml` helper](../reference/tags.md#xml-tag)编写内联模板很好，但是没有语法突出显示，这使得很容易出现格式不正确的xml。 有些编辑器支持这种情况下的语法高亮显示。例如，VS Code 有一个插件`Comment tagged template`，如果安装，将正确显示标签模板:

```js
    static template = xml /* xml */`<div>todo app</div>`;
```

备注4: 大型应用程序可能希望能够转化模板。使用内联模板会使它稍微困难一些，因为我们需要额外的工具来从代码中提取xml，并将其替换为翻译后的值。

## 3. 展示任务列表

基础工作已经完成，现在是时候开始考虑任务了。为了完成我们的需求，我们将任务表示为一个对象数组，具有以下键:

- `id`:  一个数字。有一种唯一标识任务的方法是非常有用的。因为标题是由用户创建/编辑的，所以它不能保证它是唯一的。因此，我们将为每个任务生成一个惟一的id号。
- `title`: 字符串，描述任务的内容
- `isCompleted`: 布尔值，跟踪任务的状态

状态的内部格式确定之后让我们添加演示数据和模板到 `App` 组件:

```js
class App extends Component {
  static template = xml/* xml */ `
    <div class="task-list">
        <t t-foreach="tasks" t-as="task" t-key="task.id">
            <div class="task">
                <input type="checkbox" t-att-checked="task.isCompleted"/>
                <span><t t-esc="task.title"/></span>
            </div>
        </t>
    </div>`;

  tasks = [
    {
      id: 1,
      title: "buy milk",
      isCompleted: true,
    },
    {
      id: 2,
      title: "clean house",
      isCompleted: false,
    },
  ];
}
```

模板包含一个 [`t-foreach`](../reference/qweb_templating_language.md#loops) 循环来遍历任务。它可以从组件中找到 `tasks` 列表, 因为组件是渲染上下文。注意，我们使用每个任务的id作为`t-key`, 这很常见。有两个css类: `task-list` 和`task`，我们将在下一节中使用它们。

最后，请注意`t-att-checked` 属性的使用:使用 [`t-att`](../reference/qweb_templating_language.md#dynamic-attributes) 作为属性前缀使其成为动态的。 Owl将计算表达式并将其设置为属性的值。

## 4. 布局: 一些基础的样式

到目前为止，我们的任务列表看起来相当糟糕。让我们在`app.css`中添加以下内容:

```css
.task-list {
  width: 300px;
  margin: 50px auto;
  background: aliceblue;
  padding: 10px;
}

.task {
  font-size: 18px;
  color: #111111;
}
```

这下效果好多了，现在，让我们添加一个额外的特性:已完成的任务应该有一点不同的样式，以便更清楚地表明它们不是那么重要。为此，我们将在每个任务上添加一个动态css类:

```xml
    <div class="task" t-att-class="task.isCompleted ? 'done' : ''">
```

```css
.task.done {
  opacity: 0.7;
}
```

注意，我们在这里使用了另一个动态属性。

## 5. 提取Task作为子组件

现在很清楚，应该有一个`Task` 组件来封装任务的外观和行为。

这个 `Task` 组件将显示一个任务，但它不能拥有该任务的状态:一块数据应该只有一个所有者。否则就是自找麻烦。因此, `Task` 应该从 `prop`获取数据， 这意味着数据仍然属于 `App` 组件, 但可以由`Task`组件使用(不能修改数据).

现在我们重构一下代码：

```js
// -------------------------------------------------------------------------
// Task Component
// -------------------------------------------------------------------------
const TASK_TEMPLATE = xml /* xml */`
    <div class="task" t-att-class="props.task.isCompleted ? 'done' : ''">
        <input type="checkbox" t-att-checked="props.task.isCompleted"/>
        <span><t t-esc="props.task.title"/></span>
    </div>`;

class Task extends Component {
    static template = TASK_TEMPLATE;
    static props = ["task"];
}

// -------------------------------------------------------------------------
// App Component
// -------------------------------------------------------------------------
const APP_TEMPLATE = xml /* xml */`
    <div class="task-list">
        <t t-foreach="tasks" t-as="task" t-key="task.id">
            <Task task="task"/>
        </t>
    </div>`;

class App extends Component {
    static template = APP_TEMPLATE;
    static components = { Task };

    tasks = [
        ...
    ];
}

// -------------------------------------------------------------------------
// 初始化代码
// -------------------------------------------------------------------------
function setup() {
    owl.config.mode = "dev";
    mount(App, { target: document.body });
}

whenReady(setup);
```

这里发生了很多事情:

- 首先我们有一个子组件 `Task`, 在文件的顶部定义
- 无论何时定义子组件，都需要将其添加到父组件的静态[`components`](../reference/component.md#static-properties)键中，因此Owl可以获得对它的引用
- 模板已经从组件中提取出来，以便更容易区分“视图/模板”代码和“脚本/行为”代码
- `Task` 组件有一个静态属性`props` : 这只用于验证目的。这个属性说明 `Task`应该被精确地给予一个prop, 命名为`task`. 如果不是这样，Owl将抛出一个[error](../reference/props_validation.md). 这在重构组件时非常有用
- 最后，要激活道具验证，我们需要将Owl的[mode](../reference/config.md#mode) 设置为dev，这在setup函数中完成。请注意，当应用程序在实际生产环境中使用时，应该删除这一点，因为`dev`模式会因为额外的检查和验证而稍微慢一些。

## 6. 添加任务(part 1)

我们仍然使用硬编码的任务列表。现在是时候让用户自己添加任务了。第一步是向`App` 组件添加一个输入框。但是这个输入框将在任务列表之外，所以我们需要调整`App`模板，js和css: 

```xml
<div class="todo-app">
    <input placeholder="Enter a new task" t-on-keyup="addTask"/>
    <div class="task-list">
        <t t-foreach="tasks" t-as="task" t-key="task.id">
            <Task task="task"/>
        </t>
    </div>
</div>
```

```js
addTask(ev) {
    // 13 is keycode for ENTER
    if (ev.keyCode === 13) {
        const title = ev.target.value.trim();
        ev.target.value = "";
        console.log('adding task', title);
        // todo
    }
}
```

```css
.todo-app {
  width: 300px;
  margin: 50px auto;
  background: aliceblue;
  padding: 10px;
}

.todo-app > input {
  display: block;
  margin: auto;
}

.task-list {
  margin-top: 8px;
}
```

现在我们有了一个可以工作的输入框，每当用户添加任务时，该输入都会记录到控制台。请注意，当您加载页面时，输入是没有焦点的。但是添加任务是任务列表的核心特性，所以让我们通过聚焦输入框来尽可能快地添加任务。

由于 `App`是一个组件, 我们可以实现一个[`mounted`生命周期方法](../reference/component.md#lifecycle) ，我们还需要通过使用`t-ref` 指令与 [`useRef`](../reference/hooks.md#useref) 钩子获得输入框的引用，:

```xml
<input placeholder="Enter a new task" t-on-keyup="addTask" t-ref="add-input"/>
```

```js
// 在文件的顶部
const { useRef } = owl.hooks;
```

```js
// 在App组件中
inputRef = useRef("add-input");

mounted() {
    this.inputRef.el.focus();
}
```

`inputRef` 被定义为一个类字段，因此它等同于在构造函数中定义它。 它只是指示Owl保留对具有相应`t-ref`关键字的任何内容的引用，我们可以实现`mounted`生命周期方法，现在我们获得了一个激活的引用，我们可以使用它来让输入框自动获得焦点。

## 7.  添加任务(part 2)

在上一节中，除了实现实际创建任务的代码外，我们做了所有工作!所以，让我们现在就开始吧。

我们需要一种方法来生成唯一的 `id` 。为此，我们只需在`App`中添加一个`nextId` 号码即可 . 同时，让我们删除`App`中的演示任务:

```js
nextId = 1;
tasks = [];
```

现在，可以实现`addTask`方法:

```js
addTask(ev) {
    // 13 is keycode for ENTER
    if (ev.keyCode === 13) {
        const title = ev.target.value.trim();
        ev.target.value = "";
        if (title) {
            const newTask = {
                id: this.nextId++,
                title: title,
                isCompleted: false,
            };
            this.tasks.push(newTask);
        }
    }
}
```

这几乎可以工作，但是如果您测试它，您将注意到，当用户按`Enter`键时，不会显示任何新任务。但是如果您添加 `debugger` 或`console.log` 语句，您将看到代码实际按预期运行。 问题是Owl无法知道它需要重新渲染用户界面，我们可以使用[`useState`](../reference/hooks.md#usestate) 钩子让 `tasks` 成为响应式的来解决这个问题：

```js
// 在文件顶部
const { useRef, useState } = owl.hooks;

// 将App中的任务定义替换为:
tasks = useState([]);
```

它现在可以正常工作了!

## 8. 切换任务

如果您试图将一个任务标记为已完成，您可能会注意到文本不透明度没有变化。这是因为没有代码来修改`isCompleted`标志。

现在，出现一个有趣的情况：任务由`Task`组件显示，但它不是其状态的所有者，因此它不能修改它。相反我们需要向`App`组件发送切换组件的请求，由于`App`是`Task`的父类，我们可以在`Task`中[trigger](../reference/event_handling.md) 一个事件并在`App`中侦听它。

在 `Task`组建中, 修改`input` 如下:

```xml
<input type="checkbox" t-att-checked="props.task.isCompleted" t-on-click="toggleTask"/>
```

并且添加 `toggleTask` 方法:

```js
toggleTask() {
    this.trigger('toggle-task', {id: this.props.task.id});
}
```

现在我们需要在`App`模板中监听该事件：

```xml
<div class="task-list" t-on-toggle-task="toggleTask">
```

并且实现`toggleTask` 方法:

```js
toggleTask(ev) {
    const task = this.tasks.find(t => t.id === ev.detail.id);
    task.isCompleted = !task.isCompleted;
}
```

## 9. 删除任务

现在让我们添加执行删除任务的可能性。为此，我们首先需要在每个任务上添加一个垃圾桶图标，然后我们将像上一节一样继续进行。

首先我们更新 `Task` 组件模板， css 和 js:

```xml
<div class="task" t-att-class="props.task.isCompleted ? 'done' : ''">
    <input type="checkbox" t-att-checked="props.task.isCompleted" t-on-click="toggleTask"/>
    <span><t t-esc="props.task.title"/></span>
    <span class="delete" t-on-click="deleteTask">🗑</span>
</div>
```

```css
.task {
  font-size: 18px;
  color: #111111;
  display: grid;
  grid-template-columns: 30px auto 30px;
}

.task > input {
  margin: auto;
}

.delete {
  opacity: 0;
  cursor: pointer;
  text-align: center;
}

.task:hover .delete {
  opacity: 1;
}
```

```js
deleteTask() {
    this.trigger('delete-task', {id: this.props.task.id});
}
```

现在我们需要在`App`组件中监听`delete-task`事件 :

```xml
<div class="task-list" t-on-toggle-task="toggleTask" t-on-delete-task="deleteTask">
```

```js
deleteTask(ev) {
    const index = this.tasks.findIndex(t => t.id === ev.detail.id);
    this.tasks.splice(index, 1);
}
```

## 10. 使用store API

看一下代码，很明显，我们现在有了处理分散在多个地方的任务的代码。此外，它还混合了UI代码和业务逻辑代码。Owl有一种独立于用户界面管理状态的方法:[`Store`](../reference/store.md).

让我们在应用程序中使用它。这是一个相当大的重构(对于我们的应用程序而言)，因为它涉及到从组件中提取所有与任务相关的代码。下面是`app.js`文件的新内容:

```js
const { Component, Store } = owl;
const { xml } = owl.tags;
const { whenReady } = owl.utils;
const { useRef, useDispatch, useStore } = owl.hooks;

// -------------------------------------------------------------------------
// Store
// -------------------------------------------------------------------------
const actions = {
  addTask({ state }, title) {
    title = title.trim();
    if (title) {
      const task = {
        id: state.nextId++,
        title: title,
        isCompleted: false,
      };
      state.tasks.push(task);
    }
  },
  toggleTask({ state }, id) {
    const task = state.tasks.find((t) => t.id === id);
    task.isCompleted = !task.isCompleted;
  },
  deleteTask({ state }, id) {
    const index = state.tasks.findIndex((t) => t.id === id);
    state.tasks.splice(index, 1);
  },
};
const initialState = {
  nextId: 1,
  tasks: [],
};

// -------------------------------------------------------------------------
// Task Component
// -------------------------------------------------------------------------
const TASK_TEMPLATE = xml/* xml */ `
    <div class="task" t-att-class="props.task.isCompleted ? 'done' : ''">
        <input type="checkbox" t-att-checked="props.task.isCompleted"
                t-on-click="dispatch('toggleTask', props.task.id)"/>
        <span><t t-esc="props.task.title"/></span>
        <span class="delete" t-on-click="dispatch('deleteTask', props.task.id)">🗑</span>
    </div>`;

class Task extends Component {
  static template = TASK_TEMPLATE;
  static props = ["task"];
  dispatch = useDispatch();
}

// -------------------------------------------------------------------------
// App Component
// -------------------------------------------------------------------------
const APP_TEMPLATE = xml/* xml */ `
    <div class="todo-app">
        <input placeholder="Enter a new task" t-on-keyup="addTask" t-ref="add-input"/>
        <div class="task-list">
            <t t-foreach="tasks" t-as="task" t-key="task.id">
                <Task task="task"/>
            </t>
        </div>
    </div>`;

class App extends Component {
  static template = APP_TEMPLATE;
  static components = { Task };

  inputRef = useRef("add-input");
  tasks = useStore((state) => state.tasks);
  dispatch = useDispatch();

  mounted() {
    this.inputRef.el.focus();
  }

  addTask(ev) {
    // 13 is keycode for ENTER
    if (ev.keyCode === 13) {
      this.dispatch("addTask", ev.target.value);
      ev.target.value = "";
    }
  }
}

// -------------------------------------------------------------------------
// Setup code
// -------------------------------------------------------------------------
function setup() {
  owl.config.mode = "dev";
  const store = new Store({ actions, state: initialState });
  App.env.store = store;
  mount(App, { target: document.body });
}

whenReady(setup);
```

## 11-保存任务到local storage

现在，我们的TodoApp工作得很好，除非用户关闭或刷新浏览器!只在内存中保存应用程序的状态确实很不方便。为了解决这个问题，我们将把任务保存在local storage。对于我们当前的代码库，这是一个简单的改变:只需要修改初始化代码。

```js
function makeStore() {
  const localState = window.localStorage.getItem("todoapp");
  const state = localState ? JSON.parse(localState) : initialState;
  const store = new Store({ state, actions });
  store.on("update", null, () => {
    localStorage.setItem("todoapp", JSON.stringify(store.state));
  });
  return store;
}

function setup() {
  owl.config.mode = "dev";
  const env = {store = makeStore()};
  mount(App, { target: document.body, env });
}
```

关键的一点是使用了这样一个事实，即`store` 是一个[`EventBus`](../reference/event_bus.md) ，每当它被更新时，它就会触发一个`update`事件。

## 12. 过滤任务

到目前为止应用已经差不多完成了，我们可以添加/更新/删除任务。唯一缺少的特性是根据任务完成状态显示任务。我们需要跟踪`App`中的filter状态值, 然后根据它的值过滤可见的任务。

```js
// 在文件顶部，重新添加useState:
const { useRef, useDispatch, useState, useStore } = owl.hooks;

// 在App组件中:
filter = useState({value: "all"})

get displayedTasks() {
    switch (this.filter.value) {
        case "active": return this.tasks.filter(t => !t.isCompleted);
        case "completed": return this.tasks.filter(t => t.isCompleted);
        case "all": return this.tasks;
    }
}

setFilter(filter) {
    this.filter.value = filter;
}
```

最后，我们会添加显示可见性的过滤器，同时，在主列表下面的一个小面板中显示任务的数量:

```xml
<div class="todo-app">
    <input placeholder="Enter a new task" t-on-keyup="addTask" t-ref="add-input"/>
    <div class="task-list">
        <t t-foreach="displayedTasks" t-as="task" t-key="task.id">
            <Task task="task"/>
        </t>
    </div>
    <div class="task-panel" t-if="tasks.length">
        <div class="task-counter">
            <t t-esc="displayedTasks.length"/>
            <t t-if="displayedTasks.length lt tasks.length">
                / <t t-esc="tasks.length"/>
            </t>
            task(s)
        </div>
        <div>
            <span t-foreach="['all', 'active', 'completed']"
                t-as="f" t-key="f"
                t-att-class="{active: filter.value===f}"
                t-on-click="setFilter(f)"
                t-esc="f"/>
        </div>
    </div>
</div>
```

```css
.task-panel {
  color: #0088ff;
  margin-top: 8px;
  font-size: 14px;
  display: flex;
}

.task-panel .task-counter {
  flex-grow: 1;
}

.task-panel span {
  padding: 5px;
  cursor: pointer;
}

.task-panel span.active {
  font-weight: bold;
}
```

请注意，我们使用对象语法动态地设置过滤器的类:如果每个键的值是true，则每个键都是我们想要设置的类。

## 13. 最后让任务可点击

目前我们的任务列表是功能已基本完善，我们还可以添加一些额外的细节来改善用户体验：

1. 当用户鼠标停留在任务上时，添加视觉反馈:

```css
.task:hover {
  background-color: #def0ff;
}
```

2. 使任务的标题可点击，以切换其复选框:

```xml
<input type="checkbox" t-att-checked="props.task.isCompleted"
    t-att-id="props.task.id"
    t-on-click="dispatch('toggleTask', props.task.id)"/>
<label t-att-for="props.task.id"><t t-esc="props.task.title"/></label>
```

3. 突出显示已完成任务的标题：

```css
.task.done label {
  text-decoration: line-through;
}
```

## 最终代码

我们的应用程序现在已经完成，它能工作，UI代码与业务逻辑代码很好地分离，它是可测试的，所有代码加起来不超过150行(包括模板!)

最后的代码如下，以供参考:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OWL Todo App</title>
    <link rel="stylesheet" href="app.css" />
    <script src="owl.js"></script>
    <script src="app.js"></script>
  </head>
  <body></body>
</html>
```

```js
(function () {
  const { Component, Store } = owl;
  const { xml } = owl.tags;
  const { whenReady } = owl.utils;
  const { useRef, useDispatch, useState, useStore } = owl.hooks;

  // -------------------------------------------------------------------------
  // Store
  // -------------------------------------------------------------------------
  const actions = {
    addTask({ state }, title) {
      title = title.trim();
      if (title) {
        const task = {
          id: state.nextId++,
          title: title,
          isCompleted: false,
        };
        state.tasks.push(task);
      }
    },
    toggleTask({ state }, id) {
      const task = state.tasks.find((t) => t.id === id);
      task.isCompleted = !task.isCompleted;
    },
    deleteTask({ state }, id) {
      const index = state.tasks.findIndex((t) => t.id === id);
      state.tasks.splice(index, 1);
    },
  };

  const initialState = {
    nextId: 1,
    tasks: [],
  };

  // -------------------------------------------------------------------------
  // Task Component
  // -------------------------------------------------------------------------
  const TASK_TEMPLATE = xml/* xml */ `
    <div class="task" t-att-class="props.task.isCompleted ? 'done' : ''">
        <input type="checkbox" t-att-checked="props.task.isCompleted"
            t-att-id="props.task.id"
            t-on-click="dispatch('toggleTask', props.task.id)"/>
        <label t-att-for="props.task.id"><t t-esc="props.task.title"/></label>
        <span class="delete" t-on-click="dispatch('deleteTask', props.task.id)">🗑</span>
    </div>`;

  class Task extends Component {
    static template = TASK_TEMPLATE;
    static props = ["task"];
    dispatch = useDispatch();
  }

  // -------------------------------------------------------------------------
  // App Component
  // -------------------------------------------------------------------------
  const APP_TEMPLATE = xml/* xml */ `
    <div class="todo-app">
        <input placeholder="Enter a new task" t-on-keyup="addTask" t-ref="add-input"/>
        <div class="task-list">
            <Task t-foreach="displayedTasks" t-as="task" t-key="task.id" task="task"/>
        </div>
        <div class="task-panel" t-if="tasks.length">
            <div class="task-counter">
                <t t-esc="displayedTasks.length"/>
                <t t-if="displayedTasks.length lt tasks.length">
                    / <t t-esc="tasks.length"/>
                </t>
                task(s)
            </div>
            <div>
                <span t-foreach="['all', 'active', 'completed']"
                    t-as="f" t-key="f"
                    t-att-class="{active: filter.value===f}"
                    t-on-click="setFilter(f)"
                    t-esc="f"/>
            </div>
        </div>
    </div>`;

  class App extends Component {
    static template = APP_TEMPLATE;
    static components = { Task };

    inputRef = useRef("add-input");
    tasks = useStore((state) => state.tasks);
    filter = useState({ value: "all" });
    dispatch = useDispatch();

    mounted() {
      this.inputRef.el.focus();
    }

    addTask(ev) {
      // 13 is keycode for ENTER
      if (ev.keyCode === 13) {
        this.dispatch("addTask", ev.target.value);
        ev.target.value = "";
      }
    }

    get displayedTasks() {
      switch (this.filter.value) {
        case "active":
          return this.tasks.filter((t) => !t.isCompleted);
        case "completed":
          return this.tasks.filter((t) => t.isCompleted);
        case "all":
          return this.tasks;
      }
    }
    setFilter(filter) {
      this.filter.value = filter;
    }
  }

  // -------------------------------------------------------------------------
  // Setup code
  // -------------------------------------------------------------------------
  function makeStore() {
    const localState = window.localStorage.getItem("todoapp");
    const state = localState ? JSON.parse(localState) : initialState;
    const store = new Store({ state, actions });
    store.on("update", null, () => {
      localStorage.setItem("todoapp", JSON.stringify(store.state));
    });
    return store;
  }

  function setup() {
    owl.config.mode = "dev";
    const env = {store = makeStore()};
    mount(App, { target: document.body, env });
  }

  whenReady(setup);
})();
```

```css
.todo-app {
  width: 300px;
  margin: 50px auto;
  background: aliceblue;
  padding: 10px;
}

.todo-app > input {
  display: block;
  margin: auto;
}

.task-list {
  margin-top: 8px;
}

.task {
  font-size: 18px;
  color: #111111;
  display: grid;
  grid-template-columns: 30px auto 30px;
}

.task:hover {
  background-color: #def0ff;
}

.task > input {
  margin: auto;
}

.delete {
  opacity: 0;
  cursor: pointer;
  text-align: center;
}

.task:hover .delete {
  opacity: 1;
}

.task.done {
  opacity: 0.7;
}
.task.done label {
  text-decoration: line-through;
}

.task-panel {
  color: #0088ff;
  margin-top: 8px;
  font-size: 14px;
  display: flex;
}

.task-panel .task-counter {
  flex-grow: 1;
}

.task-panel span {
  padding: 5px;
  cursor: pointer;
}

.task-panel span.active {
  font-weight: bold;
}
```
