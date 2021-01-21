---
description: 在Ubuntu 20.04安装OpenStack Victoria，安装配置网络服务Neutron
date: 2021-01-21
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(七)：配置Neutron

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
|    Neutron Server     |
|  L2,L3,Metadata Agent |
+-----------------------+
```

1. 首先在Keystone中对Neutron添加用户

```shell
# create [neutron] user in [service] project
root@dlp ~(keystone)# openstack user create --domain default --project service --password servicepassword neutron
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| default_project_id  | 37197271a1954ddb90207a95d5f46488 |
| domain_id           | default                          |
| enabled             | True                             |
| id                  | 2eadb99a37544406bc01b71eb7fb1b1c |
| name                | neutron                          |
| options             | {}                               |
| password_expires_at | None                             |
+---------------------+----------------------------------+

# add [neutron] user in [admin] role
root@dlp ~(keystone)# openstack role add --project service --user neutron admin
# create service entry for [neutron]
root@dlp ~(keystone)# openstack service create --name neutron --description "OpenStack Networking service" network
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | OpenStack Networking service     |
| enabled     | True                             |
| id          | 8cc680306fa24f59b223f15c7b7a1b30 |
| name        | neutron                          |
| type        | network                          |
+-------------+----------------------------------+

# define Neutron API Host
root@dlp ~(keystone)# export controller=192.168.56.102
# create endpoint for [neutron] (public)
root@dlp ~(keystone)# openstack endpoint create --region RegionOne network public http://$controller:9696
+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
| id           | da3196b34fee4bd194686aadcf4290c5 |
| interface    | public                           |
| region       | RegionOne                        |
| region_id    | RegionOne                        |
| service_id   | 8cc680306fa24f59b223f15c7b7a1b30 |
| service_name | neutron                          |
| service_type | network                          |
| url          | http://192.168.56.102:9696            |
+--------------+----------------------------------+

# create endpoint for [neutron] (internal)
root@dlp ~(keystone)# openstack endpoint create --region RegionOne network internal http://$controller:9696
+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
| id           | 053b576bebdb4228b1ec188afab337d8 |
| interface    | internal                         |
| region       | RegionOne                        |
| region_id    | RegionOne                        |
| service_id   | 8cc680306fa24f59b223f15c7b7a1b30 |
| service_name | neutron                          |
| service_type | network                          |
| url          | http://192.168.56.102:9696            |
+--------------+----------------------------------+

# create endpoint for [neutron] (admin)
root@dlp ~(keystone)# openstack endpoint create --region RegionOne network admin http://$controller:9696
+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
| id           | 012a048ea9604d03b809acbcb3b432af |
| interface    | admin                            |
| region       | RegionOne                        |
| region_id    | RegionOne                        |
| service_id   | 8cc680306fa24f59b223f15c7b7a1b30 |
| service_name | neutron                          |
| service_type | network                          |
| url          | http://192.168.56.102:9696            |
+--------------+----------------------------------+
```

2. 对Neutron服务添加数据库的用户和数据库

   ```mysql
   root@dlp ~(keystone)# mysql
   Welcome to the MariaDB monitor.  Commands end with ; or \g.
   Your MariaDB connection id is 105
   Server version: 10.3.22-MariaDB-1ubuntu1 Ubuntu 20.04
   
   Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   MariaDB [(none)]> create database neutron_ml2; 
   Query OK, 1 row affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on neutron_ml2.* to neutron@'localhost' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> grant all privileges on neutron_ml2.* to neutron@'%' identified by 'password'; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> flush privileges; 
   Query OK, 0 rows affected (0.00 sec)
   
   MariaDB [(none)]> exit 
   Bye
   ```

3. 安装Neutron服务

   ```shell
   root@dlp ~(keystone)# apt -y install neutron-server neutron-plugin-ml2 neutron-linuxbridge-agent neutron-l3-agent neutron-dhcp-agent neutron-metadata-agent python3-neutronclient
   ```

4. 配置Neutron

   ```shell
   root@dlp ~(keystone)# mv /etc/neutron/neutron.conf /etc/neutron/neutron.conf.org
   root@dlp ~(keystone)# vi /etc/neutron/neutron.conf
   # create new
   [DEFAULT]
   core_plugin = ml2
   service_plugins = router
   auth_strategy = keystone
   state_path = /var/lib/neutron
   dhcp_agent_notification = True
   allow_overlapping_ips = True
   notify_nova_on_port_status_changes = True
   notify_nova_on_port_data_changes = True
   # RabbitMQ connection info
   transport_url = rabbit://openstack:password@192.168.56.102
   
   [agent]
   root_helper = sudo /usr/bin/neutron-rootwrap /etc/neutron/rootwrap.conf
   
   # Keystone auth info
   [keystone_authtoken]
   www_authenticate_uri = http://192.168.56.102:5000
   auth_url = http://192.168.56.102:5000
   memcached_servers = 192.168.56.102:11211
   auth_type = password
   project_domain_name = default
   user_domain_name = default
   project_name = service
   username = neutron
   password = servicepassword
   
   # MariaDB connection info
   [database]
   connection = mysql+pymysql://neutron:password@192.168.56.102/neutron_ml2
   
   # Nova auth info
   [nova]
   auth_url = http://192.168.56.102:5000
   auth_type = password
   project_domain_name = default
   user_domain_name = default
   region_name = RegionOne
   project_name = service
   username = nova
   password = servicepassword
   
   [oslo_concurrency]
   lock_path = $state_path/tmp
   
   root@dlp ~(keystone)# chmod 640 /etc/neutron/neutron.conf
   root@dlp ~(keystone)# chgrp neutron /etc/neutron/neutron.conf
   root@dlp ~(keystone)# vi /etc/neutron/l3_agent.ini
   # line 21: add
   interface_driver = linuxbridge
   root@dlp ~(keystone)# vi /etc/neutron/dhcp_agent.ini
   # line 21: add
   interface_driver = linuxbridge
   # line 43: uncomment
   dhcp_driver = neutron.agent.linux.dhcp.Dnsmasq
   # line 52: uncomment and change
   enable_isolated_metadata = true
   root@dlp ~(keystone)# vi /etc/neutron/metadata_agent.ini
   # line 22: uncomment and specify Nova API server
   nova_metadata_host = 192.168.56.102
   # line 34: uncomment and specify any secret key you like
   metadata_proxy_shared_secret = metadata_secret
   # line 307: uncomment and specify Memcache Server
   memcache_servers = 192.168.56.102:11211
   root@dlp ~(keystone)# vi /etc/neutron/plugins/ml2/ml2_conf.ini
   # line 154: add
   # OK with no value for [tenant_network_types] now (set later if need)
   [ml2]
   type_drivers = flat,vlan,vxlan
   tenant_network_types =
   mechanism_drivers = linuxbridge
   extension_drivers = port_security
   root@dlp ~(keystone)# vi /etc/neutron/plugins/ml2/linuxbridge_agent.ini
   # line 225: add
   [securitygroup]
   enable_security_group = True
   firewall_driver = iptables
   enable_ipset = True
   # line 284: add own IP address
   local_ip = 192.168.56.102
   root@dlp ~(keystone)# vi /etc/nova/nova.conf
   # add follows into [DEFAULT] section
   use_neutron = True
   linuxnet_interface_driver = nova.network.linux_net.LinuxBridgeInterfaceDriver
   firewall_driver = nova.virt.firewall.NoopFirewallDriver
   vif_plugging_is_fatal = True
   vif_plugging_timeout = 300
   
   # add follows to the end : Neutron auth info
   # the value of [metadata_proxy_shared_secret] is the same with the one in [metadata_agent.ini]
   [neutron]
   auth_url = http://192.168.56.102:5000
   auth_type = password
   project_domain_name = default
   user_domain_name = default
   region_name = RegionOne
   project_name = service
   username = neutron
   password = servicepassword
   service_metadata_proxy = True
   metadata_proxy_shared_secret = metadata_secret
   ```

5. 开启Neutron服务

```shell
root@dlp ~(keystone)# ln -s /etc/neutron/plugins/ml2/ml2_conf.ini /etc/neutron/plugin.ini
root@dlp ~(keystone)# su -s /bin/bash neutron -c "neutron-db-manage --config-file /etc/neutron/neutron.conf --config-file /etc/neutron/plugin.ini upgrade head"
root@dlp ~(keystone)# for service in server l3-agent dhcp-agent metadata-agent linuxbridge-agent; do
systemctl restart neutron-$service
systemctl enable neutron-$service
done
root@dlp ~(keystone)# systemctl restart nova-api nova-compute
# show status
root@dlp ~(keystone)# openstack network agent list
+--------------------------------------+--------------------+---------------+-------------------+-------+-------+---------------------------+
| ID                                   | Agent Type         | Host          | Availability Zone | Alive | State | Binary                    |
+--------------------------------------+--------------------+---------------+-------------------+-------+-------+---------------------------+
| 00beb725-5cdb-4c66-a66e-d06228d2f60e | L3 agent           | dlp.srv.world | nova              | :-)   | UP    | neutron-l3-agent          |
| 639cbcde-f8e7-40b5-8b58-0e1f5f3279d6 | Metadata agent     | dlp.srv.world | None              | :-)   | UP    | neutron-metadata-agent    |
| 8c640048-f290-43db-8183-bfe54782ce11 | Linux bridge agent | dlp.srv.world | None              | :-)   | UP    | neutron-linuxbridge-agent |
| 9dbf18fb-6412-4621-a4a5-af08c5a108ec | DHCP agent         | dlp.srv.world | nova              | :-)   | UP    | neutron-dhcp-agent        |
+--------------------------------------+--------------------+---------------+-------------------+-------+-------+---------------------------+
```

