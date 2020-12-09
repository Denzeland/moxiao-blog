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
- 任务可以标记为已完成
- tasks can be marked as completed
- 可以过滤任务展示进行中/已完成任务

这个项目将是一个发现和学习一些重要的Owl概念的机会，比如组件、状态管理以及如何组织应用程序。

## 目录

1. [初始化项目](#_1-初始化项目)
2. [添加第一个组件](#_2-添加第一个组件)
3. [展示任务列表](#_3-展示任务列表)
4. [布局: 一些基础的样式](#4-layout-some-basic-css)
5. [提取Task作为子组件](#5-extracting-task-as-a-subcomponent)
6. [添加任务(part 1)](#6-adding-tasks-part-1)
7. [添加任务(part 2)](#7-adding-tasks-part-2)
8. [切换任务](#8-toggling-tasks)
9. [删除任务](#9-deleting-tasks)
10. [使用store API](#10-using-a-store)
11. [保存任务到local storage](#11-saving-tasks-in-local-storage)
12. [过滤任务](#12-filtering-tasks)
13. [最后让任务可点击](#13-the-final-touch)
14. [最终代码](#final-code)

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
- `title`: a string, to explain what the task is about.
- `isCompleted`: a boolean, to keep track of the status of the task

Now that we decided on the internal format of the state, let us add some demo
data and a template to the `App` component:

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

The template contains a [`t-foreach`](../reference/qweb_templating_language.md#loops) loop to iterate
through the tasks. It can find the `tasks` list from the component, since the
component is the rendering context. Note that we use the `id` of each task as a
`t-key`, which is very common. There are two css classes: `task-list` and `task`,
that we will use in the next section.

Finally, notice the use of the `t-att-checked` attribute:
prefixing an attribute by [`t-att`](../reference/qweb_templating_language.md#dynamic-attributes) makes
it dynamic. Owl will evaluate the expression and set it as the value of the
attribute.

## 4. Layout: some basic css

So far, our task list looks quite bad. Let us add the following to `app.css`:

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

This is better. Now, let us add an extra feature: completed tasks should be
styled a little differently, to make it clearer that they are not as important.
To do that, we will add a dynamic css class on each task:

```xml
    <div class="task" t-att-class="task.isCompleted ? 'done' : ''">
```

```css
.task.done {
  opacity: 0.7;
}
```

Notice that we have here another use of a dynamic attribute.

## 5. Extracting Task as a subcomponent

It is now clear that there should be a `Task` component to encapsulate the look
and behavior of a task.

This `Task` component will display a task, but it cannot _own_ the state of the
task: a piece of data should only have one owner. Doing otherwise is asking for
trouble. So, the `Task` component will get its data as a `prop`. This means that
the data is still owned by the `App` component, but can be used by the `Task`
component (without modifying it).

Since we are moving code around, it is a good opportunity to refactor the code
a little bit:

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
// Setup code
// -------------------------------------------------------------------------
function setup() {
    owl.config.mode = "dev";
    mount(App, { target: document.body });
}

whenReady(setup);
```

A lot of stuff happened here:

- first, we have now a sub component `Task`, defined on top of the file,
- whenever we define a sub component, it needs to be added to the static
  [`components`](../reference/component.md#static-properties)
  key of its parent, so Owl can get a reference to it,
- the templates have been extracted out of the components, to make it easier to
  differentiate the "view/template" code from the "script/behavior" code,
- the `Task` component has a `props` key: this is only useful for validation
  purpose. It says that each `Task` should be given exactly one prop, named
  `task`. If this is not the case, Owl will throw an
  [error](../reference/props_validation.md). This is extremely
  useful when refactoring components
- finally, to activate the props validation, we need to set Owl's
  [mode](../reference/config.md#mode) to `dev`. This is done in the `setup`
  function. Note that this should be removed when an app is used in a real
  production environment, since `dev` mode is slightly slower, due to extra
  checks and validations.

## 6. Adding tasks (part 1)

We still use a list of hardcoded tasks. It's really time to give the user a way
to add tasks himself. The first step is to add an input to the `App` component.
But this input will be outside of the task list, so we need to adapt `App`
template, js, and css:

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

We now have a working input, which log to the console whenever the user adds a
task. Notice that when you load the page, the input is not focused. But adding
tasks is a core feature of a task list, so let us make it as fast as possible by
focusing the input.

Since `App` is a component, it has a
[`mounted` lifecycle method](../reference/component.md#lifecycle) that we can
implement. We will also need to get a reference to the input, by using the
`t-ref` directive with the [`useRef`](../reference/hooks.md#useref) hook:

```xml
<input placeholder="Enter a new task" t-on-keyup="addTask" t-ref="add-input"/>
```

```js
// on top of file:
const { useRef } = owl.hooks;
```

```js
// in App
inputRef = useRef("add-input");

mounted() {
    this.inputRef.el.focus();
}
```

The `inputRef` is defined as a class field, so it is equivalent to defining it
in the constructor. It simply instructs Owl to keep a reference to anything with
the corresponding `t-ref` keyword. We then implement the `mounted` lifecycle
method, where we now have an active reference that we can use to focus the input.

## 7. Adding tasks (part 2)

In the previous section, we did everything except implement the code that actually
create tasks! So, let us do that now.

We need a way to generate unique `id` numbers. To do that, we will simply add a
`nextId` number in `App`. At the same time, let us remove the demo tasks in `App`:

```js
nextId = 1;
tasks = [];
```

Now, the `addTask` method can be implemented:

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

This almost works, but if you test it, you will notice that no new task is ever
displayed when the user press `Enter`. But if you add a `debugger` or a
`console.log` statement, you will see that the code is actually running as
expected. The problem is that Owl has no way of knowing that it needs to rerender
the user interface. We can fix the issue by making `tasks` reactive, with the
[`useState`](../reference/hooks.md#usestate) hook:

```js
// on top of the file
const { useRef, useState } = owl.hooks;

// replace the task definition in App with the following:
tasks = useState([]);
```

It now works as expected!

## 8. Toggling tasks

If you tried to mark a task as completed, you may have noticed that the text
did not change in opacity. This is because there is no code to modify the
`isCompleted` flag.

Now, this is an interesting situation: the task is displayed by the `Task`
component, but it is not the owner of its state, so it cannot modify it. Instead,
we want to communicate the request to toggle a task to the `App` component.
Since `App` is a parent of `Task`, we can
[trigger](../reference/event_handling.md) an event in `Task` and listen
for it in `App`.

In `Task`, change the `input` to:

```xml
<input type="checkbox" t-att-checked="props.task.isCompleted" t-on-click="toggleTask"/>
```

and add the `toggleTask` method:

```js
toggleTask() {
    this.trigger('toggle-task', {id: this.props.task.id});
}
```

We now need to listen for that event in the `App` template:

```xml
<div class="task-list" t-on-toggle-task="toggleTask">
```

and implement the `toggleTask` code:

```js
toggleTask(ev) {
    const task = this.tasks.find(t => t.id === ev.detail.id);
    task.isCompleted = !task.isCompleted;
}
```

## 9. Deleting tasks

Let us now add the possibility do delete tasks. To do that, we first need to add
a trash icon on each task, then we will proceed just like in the previous section.

First, let us update the `Task` template, css and js:

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

And now, we need to listen to the `delete-task` event in `App`:

```xml
<div class="task-list" t-on-toggle-task="toggleTask" t-on-delete-task="deleteTask">
```

```js
deleteTask(ev) {
    const index = this.tasks.findIndex(t => t.id === ev.detail.id);
    this.tasks.splice(index, 1);
}
```

## 10. Using a store

Looking at the code, it is apparent that we now have code to handle tasks
scattered in more than one place. Also, it mixes UI code and business logic
code. Owl has a way to manage state separately from the user interface: a
[`Store`](../reference/store.md).

Let us use it in our application. This is a pretty large refactoring (for our
application), since it involves extracting all task related code out of the
components. Here is the new content of the `app.js` file:

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

## 11-Saving tasks in local storage

Now, our TodoApp works great, except if the user closes or refresh the browser!
It is really inconvenient to only keep the state of the application in memory.
To fix this, we will save the tasks in the local storage. With our current
codebase, it is a simple change: only the setup code needs to be updated.

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

The key point is to use the fact that the store is an
[`EventBus`](../reference/event_bus.md) which triggers an `update` event
whenever it is updated.

## 12. Filtering tasks

We are almost done, we can add/update/delete tasks. The only missing feature is
the possibility to display the task according to their completed status. We will
need to keep track of the state of the filter in `App`, then filter the visible
tasks according to its value.

```js
// on top of file, readd useState:
const { useRef, useDispatch, useState, useStore } = owl.hooks;

// in App:
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

Finally, we need to display the visible filters. We can do that, and at the
same time, display the number of tasks in a small panel below the main list:

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

Notice here that we set dynamically the class of the filter with the object
syntax: each key is a class that we want to set if its value is truthy.

## 13. The Final Touch

Our list is feature complete. We can still add a few extra details to improve
the user experience.

1. Add a visual feedback when the user mouse is over a task:

```css
.task:hover {
  background-color: #def0ff;
}
```

2. Make the title of a task clickable, to toggle its checkbox:

```xml
<input type="checkbox" t-att-checked="props.task.isCompleted"
    t-att-id="props.task.id"
    t-on-click="dispatch('toggleTask', props.task.id)"/>
<label t-att-for="props.task.id"><t t-esc="props.task.title"/></label>
```

3. Strike the title of completed task:

```css
.task.done label {
  text-decoration: line-through;
}
```

## Final code

Our application is now complete. It works, the UI code is well separated from
the business logic code, it is testable, all under 150 lines of code (template
included!).

For reference, here is the final code:

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
