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

