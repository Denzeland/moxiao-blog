---
description: 在Ubuntu 20.04安装OpenStack Victoria，安装镜像管理服务Glance
date: 2021-01-20
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(四)：配置Glance

安装完成后虚拟机的状态：

```
eth0|192.168.56.102 
+-----------+-----------+
|    [ 计算节点 ]   |
|                       |
|  MariaDB    RabbitMQ  |
|  Memcached  httpd     |
|  Keystone   Glance    |
+-----------------------+
```

1. 在Keystone中添加Glance用户和其他用户

   ```shell
   # create [glance] user in [service] project
   root@dlp ~(keystone)# openstack user create --domain default --project service --password servicepassword glance
   +---------------------+----------------------------------+
   | Field               | Value                            |
   +---------------------+----------------------------------+
   | default_project_id  | 37197271a1954ddb90207a95d5f46488 |
   | domain_id           | default                          |
   | enabled             | True                             |
   | id                  | 03d8beaafa3045d58c3417bfec3bcefa |
   | name                | glance                           |
   | options             | {}                               |
   | password_expires_at | None                             |
   +---------------------+----------------------------------+
   
   # add [glance] user in [admin] role
   root@dlp ~(keystone)# openstack role add --project service --user glance admin
   # create service entry for [glance]
   root@dlp ~(keystone)# openstack service create --name glance --description "OpenStack Image service" image
   +-------------+----------------------------------+
   | Field       | Value                            |
   +-------------+----------------------------------+
   | description | OpenStack Image service          |
   | enabled     | True                             |
   | id          | dc29d2e881244064baf020e34432b2ea |
   | name        | glance                           |
   | type        | image                            |
   +-------------+----------------------------------+
   
   # define Glance API Host
   root@dlp ~(keystone)# export controller=192.168.56.102
   # create endpoint for [glance] (public)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne image public http://$controller:9292
   +--------------+----------------------------------+
   | Field        | Value                            |
   +--------------+----------------------------------+
   | enabled      | True                             |
   | id           | 836a270305c64e2b98c67da5f5ccba66 |
   | interface    | public                           |
   | region       | RegionOne                        |
   | region_id    | RegionOne                        |
   | service_id   | dc29d2e881244064baf020e34432b2ea |
   | service_name | glance                           |
   | service_type | image                            |
   | url          | http://192.168.56.102:9292            |
   +--------------+----------------------------------+
   
   # create endpoint for [glance] (internal)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne image internal http://$controller:9292
   +--------------+----------------------------------+
   | Field        | Value                            |
   +--------------+----------------------------------+
   | enabled      | True                             |
   | id           | 3a0e72a500804667840753f213e311ed |
   | interface    | internal                         |
   | region       | RegionOne                        |
   | region_id    | RegionOne                        |
   | service_id   | dc29d2e881244064baf020e34432b2ea |
   | service_name | glance                           |
   | service_type | image                            |
   | url          | http://192.168.56.102:9292            |
   +--------------+----------------------------------+
   
   # create endpoint for [glance] (admin)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne image admin http://$controller:9292
   +--------------+----------------------------------+
   | Field        | Value                            |
   +--------------+----------------------------------+
   | enabled      | True                             |
   | id           | 6230dced062643e192a22d4c6a166c28 |
   | interface    | admin                            |
   | region       | RegionOne                        |
   | region_id    | RegionOne                        |
   | service_id   | dc29d2e881244064baf020e34432b2ea |
   | service_name | glance                           |
   | service_type | image                            |
   | url          | http://192.168.56.102:9292            |
   +--------------+----------------------------------+
   ```

2. 在MariaDB添加Glance用户和数据库

   ```shell
   root@dlp ~(keystone)# mysql
   Welcome to the MariaDB monitor.  Commands end with ; or \g.
   Your MariaDB connection id is 44
   Server version: 10.3.22-MariaDB-1ubuntu1 Ubuntu 20.04
   
   Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   MariaDB [(none)]> create database glance; 
   Query OK, 1 row affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on glance.* to glance@'localhost' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on glance.* to glance@'%' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> flush privileges; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> exit
   Bye
   ```

3. 安装Glance

   ```
   root@dlp ~(keystone)# apt -y install glance
   ```

4. 配置Glance

   ```shell
   root@dlp ~(keystone)# mv /etc/glance/glance-api.conf /etc/glance/glance-api.conf.org
   root@dlp ~(keystone)# vi /etc/glance/glance-api.conf
   # create new
   [DEFAULT]
   bind_host = 0.0.0.0
   
   [glance_store]
   stores = file,http
   default_store = file
   filesystem_store_datadir = /var/lib/glance/images/
   
   [database]
   # MariaDB connection info
   connection = mysql+pymysql://glance:password@192.168.56.102/glance
   
   # keystone auth info
   [keystone_authtoken]
   www_authenticate_uri = http://192.168.56.102:5000
   auth_url = http://192.168.56.102:5000
   memcached_servers = 192.168.56.102:11211
   auth_type = password
   project_domain_name = default
   user_domain_name = default
   project_name = service
   username = glance
   password = servicepassword
   
   [paste_deploy]
   flavor = keystone
   
   root@dlp ~(keystone)# chmod 640 /etc/glance/glance-api.conf
   root@dlp ~(keystone)# chown root:glance /etc/glance/glance-api.conf
   root@dlp ~(keystone)# su -s /bin/bash glance -c "glance-manage db_sync"
   root@dlp ~(keystone)# systemctl restart glance-api
   ```

