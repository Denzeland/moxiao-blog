---
description: 在Ubuntu 20.04安装OpenStack Victoria，增加使用OpenStack系统的用户
date: 2021-01-21
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(九)：创建系统用户

1. 创建项目名称和用户，可以取任何你喜欢的名字，同时创建实例的基本设置（虚拟CPU数量和内存大小）

```shell
# create a project
root@dlp ~(keystone)# openstack project create --domain default --description "Example Project" harry
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | Example Project                |
| domain_id   | default                          |
| enabled     | True                             |
| id          | 6c44eafd4f614985bf74b94f2aee82fb |
| is_domain   | False                            |
| name        | harry                        |
| options     | {}                               |
| parent_id   | default                          |
| tags        | []                               |
+-------------+----------------------------------+

# create a user
root@dlp ~(keystone)# openstack user create --domain default --project harry --password '123456' harry
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| default_project_id  | 6c44eafd4f614985bf74b94f2aee82fb |
| domain_id           | default                          |
| enabled             | True                             |
| id                  | a13cfae0e5eb466fae71a636a6ffb6b4 |
| name                | harry                      |
| options             | {}                               |
| password_expires_at | None                             |
+---------------------+----------------------------------+

# create a role
root@dlp ~(keystone)# openstack role create CloudUser
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | None                             |
| domain_id   | None                             |
| id          | 5528fea7004044cfbd06ba1c2684af43 |
| name        | CloudUser                        |
| options     | {}                               |
+-------------+----------------------------------+

# create a user to the role
root@dlp ~(keystone)# openstack role add --project harry --user harry CloudUser
# create a [flavor]
root@dlp ~(keystone)# openstack flavor create --id 0 --vcpus 1 --ram 2048 --disk 10 m1.small
+----------------------------+----------+
| Field                      | Value    |
+----------------------------+----------+
| OS-FLV-DISABLED:disabled   | False    |
| OS-FLV-EXT-DATA:ephemeral  | 0        |
| disk                       | 10       |
| id                         | 0        |
| name                       | m1.small |
| os-flavor-access:is_public | True     |
| properties                 |          |
| ram                        | 2048     |
| rxtx_factor                | 1.0      |
| swap                       |          |
| vcpus                      | 1        |
+----------------------------+----------+
```

