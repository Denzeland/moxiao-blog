---
description: odoo网站构建器上传本地视频功能
date: 2020-12-24
subSidebar: 'false'
categories:
 - 拨荆集录
tags:
 - odoo
typora-root-url: ..\.vuepress\public
---

## odoo网站构建器视频上传模块发布啦！

odoo的网站构建器是一个强大的功能，用户能够不写代码就能拖拽出一个响应式的网站。在使用过程中，我发现在添加视频时，只能使用在线视频平台的视频（目前支持**Youtube** , **Vimeo** , **Dailymotion** 和 ***Youku*** 视频），这意味着用户要想在网站添加自己制作的视频，必须先上传到这些平台才能使用。但是，有时我们并不想把视频上传到这些平台，而是希望我们能自己掌握视频，因此需要增加上传视频功能。

在搜索了odoo官方应用市场后，发现没有这样的模块，因此我决定自己开发这样的功能。目前功能已经开发完成， 有需要的可以支持我一下，在odoo应用市场搜索“**upload video in website builder**”下载或者点击下面的链接：

![](/upload_video.png)

[点击这里下载](https://apps.odoo.com/apps/modules/14.0/upload_video_snippet/)，*注意：本模块是基于最新的odoo14.0版本开发的，并未在其他版本使用，并不能保证其他版本能正常使用*

::: tip

本模块视频上传功能使用的是开源插件Uppy，如果你需要修改一些配置，请移步[官方文档](https://uppy.io/)，根据你自己的需要做相应的修改

:::