---
title: 网站主题的修改记录
date: 2020-11-08
publish: false
---

## 首页footer添加又拍云链接

在Footer.vue组件template中的`footer-wrapper`下添加如下代码：

```html
<div class="upyun">
      <span>本网站由</span>
      <a
        target="blank"
        href="https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral"
      >
        <img
          src="/upyun_logos/upyun_logo5.png"
          alt="又拍云logo"
          class="upyun-logo"
        />
      </a>
      <span>提供CDN加速/云存储服务</span>
    </div>
```

添加的样式：

```css
.upyun {
    display: flex;
    justify-content: center;

    .upyun-logo {
      height: 35px;
      margin: -7px 5px 0px 5px;
    }
```

## 添加vue-github-buttons组件

在vuepress中引用vue-github-buttons组件时遇到“global is not defined”错误，导致无法渲染， 经过查找原因，修改了安装的模块vue-github-buttons的源码才把问题解决了，下面记录具体的修改内容：

- 在node_modules/vue-github-buttons/plugins/vuepress/index.js文件中将import VueGitHubButtons from 'vue-github-buttons'改为import VueGitHubButtons from 'vue-github-buttons/dist/vue-github-buttons.es.js'

- 在node_modules/vue-github-buttons/dist/vue-github-buttons.es.js文件中把下面的一段代码注释掉，并删除最后的map文件引用：

  ```js
  // {
  //     var nodeFetch = require('node-fetch');
  //     if (global && !global.fetch) {
  //         global.fetch = nodeFetch;
  //         global.Headers = nodeFetch.Headers;
  //         global.Request = nodeFetch.Request;
  //         global.Response = nodeFetch.Response;
  //     }
  // }
  ```

经过以上修改再编译就不会报错。