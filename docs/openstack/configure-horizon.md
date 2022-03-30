---
description: 在Ubuntu 20.04安装OpenStack Victoria，配置OpenStack看板服务
date: 2021-01-21
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(十一)：配置OpenStack看板服务

1. 安装Horizon

   ```shell
   root@dlp ~(keystone)# apt -y install openstack-dashboard
   ```

2. 配置Horizon

   ```shell
   root@dlp ~(keystone)# vi /etc/openstack-dashboard/local_settings.py
   # line 99: change Memcache server
   CACHES = {
       'default': {
           'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
           'LOCATION': '192.168.56.102:11211',
       },
   }
   
   # line 113: add
   SESSION_ENGINE = "django.contrib.sessions.backends.cache"
   # line 126: set Openstack Host
   # line 127: comment out and add a line to specify URL of Keystone Host
   OPENSTACK_HOST = "192.168.56.102"
   #OPENSTACK_KEYSTONE_URL = "http://%s/identity/v3" % OPENSTACK_HOST
   OPENSTACK_KEYSTONE_URL = "http://192.168.56.102:5000/v3"
   # line 131: set your timezone
   TIME_ZONE = "Asia/Shanghai"
   # add to the end
   OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT = True
   OPENSTACK_KEYSTONE_DEFAULT_DOMAIN = 'Default'
   
   root@dlp ~(keystone)# systemctl restart apache2
   # this is optional setting
   # if you allow common users to access to instances details or console on the Dashboard web, set like follows
   root@dlp ~(keystone)# vi /etc/nova/policy.json
   # create new
   # default is [rule:system_admin_api], so only admin users can access
   {
     "os_compute_api:os-extended-server-attributes": "rule:admin_or_owner",
   }
   
   root@dlp ~(keystone)# chgrp nova /etc/nova/policy.json
   root@dlp ~(keystone)# chmod 640 /etc/nova/policy.json
   root@dlp ~(keystone)# systemctl restart nova-api
   ```

3. 通过http://192.168.56.102/horizon/访问OpenStack系统，可以使用初始化keystone时的超级用户admin登录，也可以使用后面创建的用户登录，登录以后可以在[这里](http://cloud-images.ubuntu.com/xenial/current/)下载ubuntu 16.04云镜像， 通过看板添加这个镜像，然后创建实例