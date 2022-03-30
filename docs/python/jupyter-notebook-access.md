---
title: 远程访问jupyter notebook
description: 本文描述如何远程访问jupyter notebook服务
date: 2021-01-29
sidebar: 'auto'
categories:
 - python集录
tags:
 - python
---

默认情况下，安装好 Jupyter之后，可以用 localhost:8888 即可。但是如果要需要远程访问，默认是不支持101.101.101.101:8888 这样的访问，需要额外配置。

设置 jupyter notebook 可远程访问的官方指南在这里，在远端服务器上执行以下操作：

生成配置文件
------

默认情况下，配置文件 `~/.jupyter/jupyter_notebook_config.py` 并不存在，需要自行创建。使用下列命令生成配置文件：

```shell
jupyter notebook --generate-config
```

执行成功后，会出现下面的信息：

Writing default config to: /root/.jupyter/jupyter\_notebook\_config.py

生成密码
----

从jupyter notebook 5.0 版本开始，提供了一个命令来设置密码：`jupyter-notebook password`，生成的密码存储在 `jupyter_notebook_config.json`。

```shell
[root@de jupyter]# jupyter-notebook password
Enter password: 
Verify password: 
[NotebookPasswordApp] Wrote hashed password to /root/.jupyter/jupyter_notebook_config.json
```

运行jupyter
---------

*   终端运行

```shell
jupyter-notebook --ip=0.0.0.0 --port 8000 --no-browser
```

*   后台运行

```shell
nohup jupyter-notebook --ip=0.0.0.0 --port 8000 --no-browser  &
```

