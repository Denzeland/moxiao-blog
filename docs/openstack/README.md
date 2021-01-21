---
description: 在Ubuntu 20.04安装OpenStack Victoria，OpenStack的简单概述
date: 2021-01-20
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(一)：概述

最近用虚拟机在Ubuntu 20.04上折腾了一下OpenStack， 初次学习，按照官方文档一步一步安装下来还是会遇到很多问题，本系列文章主要记录在安装所有OpenStack组件的过程，以备以后查阅。用到的虚拟机是virtualbox，系统是Ubuntu 20.04，安装的OpenStack版本是**Victoria**。

## 概述

OpenStack是由一系列组件组成的庞大的云计算基础设施，每个组件都有相应的代码名称，下面列出一些主要的组件，简述它们各自的功能：

| 提供的服务   | 代码名称   | 描述                                 |
| :----------- | :--------- | :----------------------------------- |
| 验证服务     | Keystone   | 用户管理                             |
| 计算服务     | Nova       | 虚拟机管理                           |
| 镜像服务     | Glance     | 管理虚拟镜像，例如内核镜像或磁盘镜像 |
| 仪表板       | Horizon    | 通过浏览器提供GUI控制台              |
| 对象存储     | Swift      | 提供云存储特性                       |
| 块存储       | Cinder     | 虚拟机的存储管理                     |
| 网络服务     | Neutron    | 虚拟网络管理                         |
| 负载均衡服务 | Octavia    | 提供负载均衡特性                     |
| 编排服务     | Heat       | 为虚拟机提供编排服务                 |
| 计量服务     | Ceilometer | 为生成账单提供使用量统计功能         |
| 数据库服务   | Trove      | 数据库资源管理                       |
| 容器服务     | Magnum     | 容器基础设施管理                     |
| 数据处理服务 | Sahara     | 提供数据处理服务                     |
| 裸机部署安装 | Ironic     | 提供裸机部署安装功能                 |
| 消息报务     | Zaqar      | 提供消息传递服务功能                 |
| 共享文件系统 | Manila     | 提供文件共享服务                     |
| DNS服务      | Designate  | 提供DNS服务器服务                    |
| 密钥管理服务 | Barbican   | 提供密钥管理服务                     |

