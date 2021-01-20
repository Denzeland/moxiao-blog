---
description: 在Ubuntu 20.04安装OpenStack Victoria，安装验证服务Keystone
date: 2021-01-20
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(三)：安装Keystone

安装完成后虚拟机的状态：

```
eth0|192.168.56.102 
+-----------+-----------+
|    [ 计算节点 ]   |
|                       |
|  MariaDB    RabbitMQ  |
|  Memcached  httpd     |
|  Keystone             |
+-----------------------+
```

1. 在MariaDB添加Keystone数据库和用户

   ```shell
   
   root@dlp:~# mysql
   Welcome to the MariaDB monitor.  Commands end with ; or \g.
   Your MariaDB connection id is 36
   Server version: 10.3.22-MariaDB-1ubuntu1 Ubuntu 20.04
   
   Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   MariaDB [(none)]> create database keystone; 
   Query OK, 1 row affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on keystone.* to keystone@'localhost' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on keystone.* to keystone@'%' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> flush privileges; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> exit
   Bye
   ```

2. 安装Keystone

   ```shell
   root@dlp:~# apt -y install keystone python3-openstackclient apache2 libapache2-mod-wsgi-py3 python3-oauth2client
   ```

3. 配置Keystone

   ```shell
   root@dlp:~# vi /etc/keystone/keystone.conf
   # line 436: uncomment and specify Memcache Server
   memcache_servers = 192.168.56.102:11211
   # line 594: change to MariaDB connection info
   connection = mysql+pymysql://keystone:password@192.168.56.102/keystone
   # line 2508: uncomment
   provider = fernet
   root@dlp:~# su -s /bin/bash keystone -c "keystone-manage db_sync"
   # initialize Fernet key
   root@dlp:~# keystone-manage fernet_setup --keystone-user keystone --keystone-group keystone
   root@dlp:~# keystone-manage credential_setup --keystone-user keystone --keystone-group keystone
   # define keystone API Host
   root@dlp:~# export controller=192.168.56.102
   # bootstrap keystone
   # set any password for [adminpassword] section
   root@dlp:~# keystone-manage bootstrap --bootstrap-password '123456' \
   --bootstrap-admin-url http://$controller:5000/v3/ \
   --bootstrap-internal-url http://$controller:5000/v3/ \
   --bootstrap-public-url http://$controller:5000/v3/ \
   --bootstrap-region-id RegionOne
   ```

4. 配置 Apache httpd

   ```shell
   root@dlp:~# vi /etc/apache2/apache2.conf
   # line 70: specify server name
   ServerName dlp.srv.world
   root@dlp:~# systemctl restart apache2
   ```

5. 设置环境变量，[OS_PASSWORD]是keystone初始化时的密码， [OS_AUTH_URL]指定Keystone服务的主机或IP地址

   ```shell
   root@dlp:~# vi ~/keystonerc
   export OS_PROJECT_DOMAIN_NAME=default
   export OS_USER_DOMAIN_NAME=default
   export OS_PROJECT_NAME=admin
   export OS_USERNAME=admin
   export OS_PASSWORD=123456
   export OS_AUTH_URL=http://192.168.56.102:5000/v3
   export OS_IDENTITY_API_VERSION=3
   export OS_IMAGE_API_VERSION=2
   export PS1='\u@\h \W(keystone)\$ '
   root@dlp:~# chmod 600 ~/keystonerc
   root@dlp:~# source ~/keystonerc
   root@dlp ~(keystone)# echo "source ~/keystonerc " >> ~/.bash_profile
   ```

6. 添加项目

   ```shell
   # create [service] project
   root@dlp ~(keystone)# openstack project create --domain default --description "Service Project" service
   +-------------+----------------------------------+
   | Field       | Value                            |
   +-------------+----------------------------------+
   | description | Service Project                  |
   | domain_id   | default                          |
   | enabled     | True                             |
   | id          | 37197271a1954ddb90207a95d5f46488 |
   | is_domain   | False                            |
   | name        | service                          |
   | options     | {}                               |
   | parent_id   | default                          |
   | tags        | []                               |
   +-------------+----------------------------------+
   
   # confirm settings
   root@dlp ~(keystone)# openstack project list
   +----------------------------------+---------+
   | ID                               | Name    |
   +----------------------------------+---------+
   | 37197271a1954ddb90207a95d5f46488 | service |
   | b573c9e160864f028fc2d681a929f5af | admin   |
   +----------------------------------+---------+
   ```

   

