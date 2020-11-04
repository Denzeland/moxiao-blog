---
title: 墨萧随笔ghost博客备份
description: 记录墨萧随笔ghost博客备份内容，不公开
date: 2020-11-03
sidebar: 'auto'
publish: false
keys:
 - 'e10adc3949ba59abbe56e057f20f883e'
---

## Code injection

### Site Header

```css
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/themes/prism-tomorrow.min.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/plugins/line-numbers/prism-line-numbers.min.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/plugins/toolbar/prism-toolbar.min.css" />
<style>
    pre[class*=language-] {
        margin: 1.75em 0;
        font-size: 1.4rem;
        background: #111;
    }
</style>
```

### Site Footer

```js
<script>
    window.addEventListener('DOMContentLoaded', (event) => {      
        document.querySelectorAll('pre[class*=language-]').forEach(function(node) {
            node.classList.add('line-numbers');
		});
        Prism.highlightAll();
    });
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/plugins/toolbar/prism-toolbar.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>
```

管理邮箱：service@admin.zdctech.top  阿里云邮箱