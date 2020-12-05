---
title: 网站主题的修改记录
date: 2020-11-08
publish: false
---

## 首页footer添加又拍云链接

在Footer.vue组件template中的 `footer-wrapper` 下添加如下代码：

``` html
<div class="upyun">
    <span>本网站由</span>
    <a target="blank" href="https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral">
        <img src="/upyun_logos/upyun_logo5.png" alt="又拍云logo" class="upyun-logo" />
    </a>
    <span>提供CDN加速/云存储服务</span>
</div>
```

添加的样式：

``` css
.upyun {
    display: flex;
    justify-content: center;

    .upyun-logo {
        height: 35px;
        margin: -7px 5px 0px 5px;
    }
}
```

## 添加vue-github-buttons组件

在vuepress中引用vue-github-buttons组件时遇到“global is not defined”错误，导致无法渲染， 经过查找原因，修改了安装的模块vue-github-buttons的源码才把问题解决了，下面记录具体的修改内容：

* 在node_modules/vue-github-buttons/plugins/vuepress/index.js文件中将import VueGitHubButtons from 'vue-github-buttons'改为import VueGitHubButtons from 'vue-github-buttons/dist/vue-github-buttons.es.js'

* 在node_modules/vue-github-buttons/dist/vue-github-buttons.es.js文件中把下面的一段代码注释掉，并删除最后的map文件引用：

  

``` js
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

## 首页loading页面修改

修改了主题的插件node_modules/@vuepress-reco/vuepress-plugin-loading-page/bin/LoadingPage.vue，将整个文件内容修改如下：

```vue
<template>
  <div id="loader-wrapper">
    <div class="spinner">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
    <!-- <div class="loader-main">
      <div v-for="item in 4" :key="`out${item}`"></div>
    </div> -->
    <h3 class="title" v-if="$frontmatter.home">
      {{ $site.title || $localeConfig.title }}
    </h3>
    <p class="description" v-if="$frontmatter.home">
      {{ $site.description || $localeConfig.description }}
    </p>
  </div>
</template>

<style lang="stylus" scoped>
#loader-wrapper {
  height: 100vh;
  width: 100vw;
  // background: #fff;
  // background: var(--background-color);
  background-color: #27ae60;

  .spinner {
    // margin: 100px auto 0;
    width: 70px;
    text-align: center;
    position: fixed;
    top: 45%;
    left: 50%;
    z-index: 555;
    transform: translate(-50%, 0);
  }

  .spinner > div {
    width: 18px;
    height: 18px;
    background-color: #fff;
    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  }

  .spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }

  @keyframes sk-bouncedelay {
    0%, 80%, 100% {
      -webkit-transform: scale(0);
    }

    40% {
      -webkit-transform: scale(1);
    }
  }

  @keyframes sk-bouncedelay {
    0%, 80%, 100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }

    40% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  .loader-main {
    position: fixed;
    width: 120px;
    height: 50px;
    top: 45%;
    left: 50%;
    z-index: 555;
    transform: translate(-50%, 0);

    div {
      &:nth-child(2) {
        animation: pacman-balls 1s 0s infinite linear;
      }

      &:nth-child(3) {
        animation: pacman-balls 1s 0.33s infinite linear;
      }

      &:nth-child(4) {
        animation: pacman-balls 1s 0.66s infinite linear;
      }

      &:nth-child(5) {
        animation: pacman-balls 1s 0.99s infinite linear;
      }

      &:first-of-type {
        width: 0px;
        height: 0px;
        border-right: 25px solid transparent;
        border-top: 25px solid $accentColor;
        border-left: 25px solid $accentColor;
        border-bottom: 25px solid $accentColor;
        border-radius: 25px;
        animation: rotate_pacman_half_up 0.5s 0s infinite;
      }

      &:nth-child(2) {
        width: 0px;
        height: 0px;
        border-right: 25px solid transparent;
        border-top: 25px solid $accentColor;
        border-left: 25px solid $accentColor;
        border-bottom: 25px solid $accentColor;
        border-radius: 25px;
        animation: rotate_pacman_half_down 0.5s 0s infinite;
        margin-top: -50px;
      }

      &:nth-child(3), &:nth-child(4), &:nth-child(5), &:nth-child(6) {
        background-color: $accentColor;
        width: 15px;
        height: 15px;
        border-radius: 100%;
        margin: 2px;
        width: 10px;
        height: 10px;
        position: absolute;
        transform: translate(0, -6.25px);
        top: 25px;
        left: 100px;
      }
    }
  }

  .title {
    margin: 8rem auto 2rem;
    text-align: center;
    // color: $textColor;
    // color: var(--text-color);
    color: #fff;
    font-size: 30px;
    box-sizing: border-box;
    padding: 0 10px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .description {
    margin: auto;
    text-align: center;
    // color: $textColor;
    // color: var(--text-color);
    color: #fff;
    font-size: 22px;
    box-sizing: border-box;
    padding: 0 10px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  @keyframes pacman-balls {
    75% {
      opacity: 0.7;
    }

    100% {
      -webkit-transform: translate(-100px, -6.25px);
      transform: translate(-100px, -6.25px);
    }
  }

  @keyframes rotate_pacman_half_up {
    0% {
      -webkit-transform: rotate(270deg);
      transform: rotate(270deg);
    }

    50% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }

    100% {
      -webkit-transform: rotate(270deg);
      transform: rotate(270deg);
    }
  }

  @keyframes rotate_pacman_half_down {
    0% {
      -webkit-transform: rotate(90deg);
      transform: rotate(90deg);
    }

    50% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }

    100% {
      -webkit-transform: rotate(90deg);
      transform: rotate(90deg);
    }
  }
}
</style>

```

