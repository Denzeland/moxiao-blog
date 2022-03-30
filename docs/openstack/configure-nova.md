---
description: 在Ubuntu 20.04安装OpenStack Victoria，安装计算服务Nova
date: 2021-01-21
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(六)：配置Nova

安装完成后虚拟机的状态：

```
eth0|192.168.56.102
+-----------+-----------+
|    [ Control Node ]   |
|                       |
|  MariaDB    RabbitMQ  |
|  Memcached  httpd     |
|  Keystone   Glance    |
|   Nova API,Compute    |
+-----------------------+
```

1. 在Keystone中为Nova创建用户和其他配置

   ```shell
   # create [nova] user in [service] project
   root@dlp ~(keystone)# openstack user create --domain default --project service --password servicepassword nova
   +---------------------+----------------------------------+
   | Field               | Value                            |
   +---------------------+----------------------------------+
   | default_project_id  | 37197271a1954ddb90207a95d5f46488 |
   | domain_id           | default                          |
   | enabled             | True                             |
   | id                  | d605621cc0f44bdcb93864d3347b2300 |
   | name                | nova                             |
   | options             | {}                               |
   | password_expires_at | None                             |
   +---------------------+----------------------------------+
   
   # add [nova] user in [admin] role
   root@dlp ~(keystone)# openstack role add --project service --user nova admin
   # create [placement] user in [service] project
   root@dlp ~(keystone)# openstack user create --domain default --project service --password servicepassword placement
   +---------------------+----------------------------------+
   | Field               | Value                            |
   +---------------------+----------------------------------+
   | default_project_id  | 37197271a1954ddb90207a95d5f46488 |
   | domain_id           | default                          |
   | enabled             | True                             |
   | id                  | 319fe43139464ecbb178e217253929f1 |
   | name                | placement                        |
   | options             | {}                               |
   | password_expires_at | None                             |
   +---------------------+----------------------------------+
   
   # add [placement] user in [admin] role
   root@dlp ~(keystone)# openstack role add --project service --user placement admin
   # create service entry for [nova]
   root@dlp ~(keystone)# openstack service create --name nova --description "OpenStack Compute service" compute
   +-------------+----------------------------------+
   | Field       | Value                            |
   +-------------+----------------------------------+
   | description | OpenStack Compute service        |
   | enabled     | True                             |
   | id          | 12d96a5e46914571bc2784e6cf865dfb |
   | name        | nova                             |
   | type        | compute                          |
   +-------------+----------------------------------+
   
   # create service entry for [placement]
   root@dlp ~(keystone)# openstack service create --name placement --description "OpenStack Compute Placement service" placement
   +-------------+-------------------------------------+
   | Field       | Value                               |
   +-------------+-------------------------------------+
   | description | OpenStack Compute Placement service |
   | enabled     | True                                |
   | id          | 69b9083898924e9597ac3426ad04bb83    |
   | name        | placement                           |
   | type        | placement                           |
   +-------------+-------------------------------------+
   
   # define Nova API Host
   root@dlp ~(keystone)# export controller=192.168.56.102
   # create endpoint for [nova] (public)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne compute public http://$controller:8774/v2.1/%\(tenant_id\)s
   +--------------+------------------------------------------+
   | Field        | Value                                    |
   +--------------+------------------------------------------+
   | enabled      | True                                     |
   | id           | a1e5b0178b124a11841c74100198b505         |
   | interface    | public                                   |
   | region       | RegionOne                                |
   | region_id    | RegionOne                                |
   | service_id   | 12d96a5e46914571bc2784e6cf865dfb         |
   | service_name | nova                                     |
   | service_type | compute                                  |
   | url          | http://192.168.56.102:8774/v2.1/%(tenant_id)s |
   +--------------+------------------------------------------+
   
   # create endpoint for [nova] (internal)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne compute internal http://$controller:8774/v2.1/%\(tenant_id\)s
   +--------------+------------------------------------------+
   | Field        | Value                                    |
   +--------------+------------------------------------------+
   | enabled      | True                                     |
   | id           | fe0ac8df5a6144de9ee65b8a668d9204         |
   | interface    | internal                                 |
   | region       | RegionOne                                |
   | region_id    | RegionOne                                |
   | service_id   | 12d96a5e46914571bc2784e6cf865dfb         |
   | service_name | nova                                     |
   | service_type | compute                                  |
   | url          | http://192.168.56.102:8774/v2.1/%(tenant_id)s |
   +--------------+------------------------------------------+
   
   # create endpoint for [nova] (admin)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne compute admin http://$controller:8774/v2.1/%\(tenant_id\)s
   +--------------+------------------------------------------+
   | Field        | Value                                    |
   +--------------+------------------------------------------+
   | enabled      | True                                     |
   | id           | 3fc1bce309cc49d5bc1929d52fa5f670         |
   | interface    | admin                                    |
   | region       | RegionOne                                |
   | region_id    | RegionOne                                |
   | service_id   | 12d96a5e46914571bc2784e6cf865dfb         |
   | service_name | nova                                     |
   | service_type | compute                                  |
   | url          | http://192.168.56.102:8774/v2.1/%(tenant_id)s |
   +--------------+------------------------------------------+
   
   # create endpoint for [placement] (public)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne placement public http://$controller:8778
   +--------------+----------------------------------+
   | Field        | Value                            |
   +--------------+----------------------------------+
   | enabled      | True                             |
   | id           | 17d8beaabbf241f2980fdef242d66cd3 |
   | interface    | public                           |
   | region       | RegionOne                        |
   | region_id    | RegionOne                        |
   | service_id   | 69b9083898924e9597ac3426ad04bb83 |
   | service_name | placement                        |
   | service_type | placement                        |
   | url          | http://192.168.56.102:8778            |
   +--------------+----------------------------------+
   
   # create endpoint for [placement] (internal)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne placement internal http://$controller:8778
   +--------------+----------------------------------+
   | Field        | Value                            |
   +--------------+----------------------------------+
   | enabled      | True                             |
   | id           | 63431099f19448c79da9ab1862c801d2 |
   | interface    | internal                         |
   | region       | RegionOne                        |
   | region_id    | RegionOne                        |
   | service_id   | 69b9083898924e9597ac3426ad04bb83 |
   | service_name | placement                        |
   | service_type | placement                        |
   | url          | http://192.168.56.102:8778            |
   +--------------+----------------------------------+
   
   # create endpoint for [placement] (admin)
   root@dlp ~(keystone)# openstack endpoint create --region RegionOne placement admin http://$controller:8778
   +--------------+----------------------------------+
   | Field        | Value                            |
   +--------------+----------------------------------+
   | enabled      | True                             |
   | id           | 5e1520b777434c11ad33caff19e023af |
   | interface    | admin                            |
   | region       | RegionOne                        |
   | region_id    | RegionOne                        |
   | service_id   | 69b9083898924e9597ac3426ad04bb83 |
   | service_name | placement                        |
   | service_type | placement                        |
   | url          | http://192.168.56.102:8778            |
   +--------------+----------------------------------+
   ```

2. 在MariaDB中添加Nova数据库和用户

   ```mysql
   root@dlp ~(keystone)# mysql
   Welcome to the MariaDB monitor.  Commands end with ; or \g.
   Your MariaDB connection id is 49
   Server version: 10.3.22-MariaDB-1ubuntu1 Ubuntu 20.04
   
   Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   MariaDB [(none)]> create database nova; 
   Query OK, 1 row affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on nova.* to nova@'localhost' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on nova.* to nova@'%' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> create database nova_api; 
   Query OK, 1 row affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on nova_api.* to nova@'localhost' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on nova_api.* to nova@'%' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> create database placement; 
   Query OK, 1 row affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on placement.* to placement@'localhost' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on placement.* to placement@'%' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> create database nova_cell0; 
   Query OK, 1 row affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on nova_cell0.* to nova@'localhost' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on nova_cell0.* to nova@'%' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> flush privileges; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> exit
   Bye
   ```

3. 安装Nova

   ```shell
   root@dlp ~(keystone)# apt -y install nova-api nova-conductor nova-scheduler nova-novncproxy placement-api python3-novaclient
   ```

4. 配置Nova

   ```shell
   root@dlp ~(keystone)# mv /etc/nova/nova.conf /etc/nova/nova.conf.org
   root@dlp ~(keystone)# vi /etc/nova/nova.conf
   # create new
   [DEFAULT]
   # define own IP address
   my_ip = 192.168.56.102
   state_path = /var/lib/nova
   enabled_apis = osapi_compute,metadata
   log_dir = /var/log/nova
   # RabbitMQ connection info
   transport_url = rabbit://openstack:password@192.168.56.102
   
   [api]
   auth_strategy = keystone
   
   # Glance connection info
   [glance]
   api_servers = http://192.168.56.102:9292
   
   [oslo_concurrency]
   lock_path = $state_path/tmp
   
   # MariaDB connection info
   [api_database]
   connection = mysql+pymysql://nova:password@192.168.56.102/nova_api
   
   [database]
   connection = mysql+pymysql://nova:password@192.168.56.102/nova
   
   # Keystone auth info
   [keystone_authtoken]
   www_authenticate_uri = http://192.168.56.102:5000
   auth_url = http://192.168.56.102:5000
   memcached_servers = 192.168.56.102:11211
   auth_type = password
   project_domain_name = default
   user_domain_name = default
   project_name = service
   username = nova
   password = servicepassword
   
   [placement]
   auth_url = http://192.168.56.102:5000
   os_region_name = RegionOne
   auth_type = password
   project_domain_name = default
   user_domain_name = default
   project_name = service
   username = placement
   password = servicepassword
   
   [wsgi]
   api_paste_config = /etc/nova/api-paste.ini
   
   root@dlp ~(keystone)# chmod 640 /etc/nova/nova.conf
   root@dlp ~(keystone)# chgrp nova /etc/nova/nova.conf
   root@dlp ~(keystone)# mv /etc/placement/placement.conf /etc/placement/placement.conf.org
   root@dlp ~(keystone)# vi /etc/placement/placement.conf
   # create new
   [DEFAULT]
   debug = false
   
   [api]
   auth_strategy = keystone
   
   [keystone_authtoken]
   www_authenticate_uri = http://192.168.56.102:5000
   auth_url = http://192.168.56.102:5000
   memcached_servers = 192.168.56.102:11211
   auth_type = password
   project_domain_name = default
   user_domain_name = default
   project_name = service
   username = placement
   password = servicepassword
   
   [placement_database]
   connection = mysql+pymysql://placement:password@192.168.56.102/placement
   
   root@dlp ~(keystone)# chmod 640 /etc/placement/placement.conf
   root@dlp ~(keystone)# chgrp placement /etc/placement/placement.conf
   ```

5. 添加数据到数据库并启动Nova服务

   ```shell
   root@dlp ~(keystone)# su -s /bin/bash placement -c "placement-manage db sync"
   root@dlp ~(keystone)# su -s /bin/bash nova -c "nova-manage api_db sync"
   root@dlp ~(keystone)# su -s /bin/bash nova -c "nova-manage cell_v2 map_cell0"
   root@dlp ~(keystone)# su -s /bin/bash nova -c "nova-manage db sync"
   root@dlp ~(keystone)# su -s /bin/bash nova -c "nova-manage cell_v2 create_cell --name cell1"
   root@dlp ~(keystone)# systemctl restart apache2
   root@dlp ~(keystone)# for service in api conductor scheduler novncproxy; do
   systemctl restart nova-$service
   done
   # show status
   root@dlp ~(keystone)# openstack compute service list
   +----+----------------+---------------+----------+---------+-------+----------------------------+
   | ID | Binary         | Host          | Zone     | Status  | State | Updated At                 |
   +----+----------------+---------------+----------+---------+-------+----------------------------+
   |  3 | nova-conductor | dlp.srv.world | internal | enabled | up    | 2020-10-19T02:30:37.000000 |
   |  4 | nova-scheduler | dlp.srv.world | internal | enabled | up    | 2020-10-19T02:30:40.000000 |
   +----+----------------+---------------+----------+---------+-------+----------------------------+
   ```

6. 安装Nova Compute.

```shell
root@dlp ~(keystone)# apt -y install nova-compute nova-compute-kvm
```

7. 在之前基础的配置基础上，增加下面的内容：

```shell
root@dlp ~(keystone)# vi /etc/nova/nova.conf
# add follows (enable VNC)
[vnc]
enabled = True
server_listen = 0.0.0.0
server_proxyclient_address = 192.168.56.102
novncproxy_base_url = http://192.168.56.102:6080/vnc_auto.html 
```

8. 开启Nova Compute服务

```shell
root@dlp ~(keystone)# systemctl restart nova-compute
# discover Compute Node
root@dlp ~(keystone)# su -s /bin/bash nova -c "nova-manage cell_v2 discover_hosts"
# show status
root@dlp ~(keystone)# openstack compute service list
+----+----------------+---------------+----------+---------+-------+----------------------------+
| ID | Binary         | Host          | Zone     | Status  | State | Updated At                 |
+----+----------------+---------------+----------+---------+-------+----------------------------+
|  3 | nova-conductor | dlp.srv.world | internal | enabled | up    | 2020-10-19T02:41:45.000000 |
|  4 | nova-scheduler | dlp.srv.world | internal | enabled | up    | 2020-10-19T02:41:45.000000 |
|  6 | nova-compute   | dlp.srv.world | nova     | enabled | up    | 2020-10-19T02:41:45.000000 |
+----+----------------+---------------+----------+---------+-------+----------------------------+
```

