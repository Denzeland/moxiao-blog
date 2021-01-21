---
description: 在Ubuntu 20.04安装OpenStack Victoria，配置Neutron网络
date: 2021-01-21
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(八)：配置虚拟机实例网络

::: tip
新建实例需要配置好Neutron网络，不然会造成实例ip无法ping通，无法ssh连接。因为我控制节点采用的网卡是host only，这里针对实例的连接需要新建一张网卡，所以在virtualbox中增加一张网卡，网络连接配置为网络地址转换NAT，并且**开启混杂模式**，实例的网络连接配置为桥接模式
:::

网卡的状态如下：

```
eth0|192.168.56.102 
+-----------+-----------+
|    [ 控制节点 ]   |
|                       |
|  MariaDB    RabbitMQ  |
|  Memcached  httpd     |
|  Keystone   Glance    |
|   Nova API,Compute    |
|    Neutron Server     |
|  L2,L3,Metadata Agent |
+-----------+-----------+
        eth1|(10.10.4.15)
```

1. 配置Neutron服务

   ```shell
   # 创建一个网卡设置文件，将[eth1]改成你的网卡名称
   root@dlp ~(keystone)# vi /etc/systemd/network/eth1.network
   [Match]
   Name=eth1
   
   [Network]
   LinkLocalAddressing=no
   IPv6AcceptRA=no
   
   root@dlp ~(keystone)# systemctl restart systemd-networkd
   root@dlp ~(keystone)# vi /etc/neutron/plugins/ml2/ml2_conf.ini
   # line 206: 增加
   [ml2_type_flat]
   flat_networks = physnet1
   root@dlp ~(keystone)# vi /etc/neutron/plugins/ml2/linuxbridge_agent.ini
   # line 190: 增加
   [linux_bridge]
   physical_interface_mappings = physnet1:eth1
   # line 257: 取消注释并修改
   enable_vxlan = false
   root@dlp ~(keystone)# systemctl restart neutron-linuxbridge-agent
   ```

2. 创建虚拟网络

   ```shell
   root@dlp ~(keystone)# projectID=$(openstack project list | grep service | awk '{print $2}')
   # 创建一个网络并命名为 [sharednet1]
   root@dlp ~(keystone)# openstack network create --project $projectID \
   --share --provider-network-type flat --provider-physical-network physnet1 sharednet1
   +---------------------------+--------------------------------------+
   | Field                     | Value                                |
   +---------------------------+--------------------------------------+
   | admin_state_up            | UP                                   |
   | availability_zone_hints   |                                      |
   | availability_zones        |                                      |
   | created_at                | 2020-10-19T03:53:34Z                 |
   | description               |                                      |
   | dns_domain                | None                                 |
   | id                        | 5317a0bf-3df8-42e8-93c2-45134fb7b645 |
   | ipv4_address_scope        | None                                 |
   | ipv6_address_scope        | None                                 |
   | is_default                | False                                |
   | is_vlan_transparent       | None                                 |
   | mtu                       | 1500                                 |
   | name                      | sharednet1                           |
   | port_security_enabled     | True                                 |
   | project_id                | 37197271a1954ddb90207a95d5f46488     |
   | provider:network_type     | flat                                 |
   | provider:physical_network | physnet1                             |
   | provider:segmentation_id  | None                                 |
   | qos_policy_id             | None                                 |
   | revision_number           | 1                                    |
   | router:external           | Internal                             |
   | segments                  | None                                 |
   | shared                    | True                                 |
   | status                    | ACTIVE                               |
   | subnets                   |                                      |
   | tags                      |                                      |
   | updated_at                | 2020-10-19T03:53:34Z                 |
   +---------------------------+--------------------------------------+
   
   # 在网络[sharednet1]创建一个子网 [10.0.4.0/24]，具体的子网范围，网关，DNS设置根据你的实际情况设置
   root@dlp ~(keystone)# openstack subnet create subnet1 --network sharednet1 \
   --project $projectID --subnet-range 10.0.4.0/24 \
   --allocation-pool start=10.0.4.200,end=10.0.4.254 \
   --gateway 10.0.4.1 --dns-nameserver 10.10.8.11
   +----------------------+--------------------------------------+
   | Field                | Value                                |
   +----------------------+--------------------------------------+
   | allocation_pools     | 10.0.0.200-10.0.0.254                |
   | cidr                 | 10.0.0.0/24                          |
   | created_at           | 2020-10-19T03:54:17Z                 |
   | description          |                                      |
   | dns_nameservers      | 10.0.0.10                            |
   | dns_publish_fixed_ip | None                                 |
   | enable_dhcp          | True                                 |
   | gateway_ip           | 10.0.0.1                             |
   | host_routes          |                                      |
   | id                   | fc5038ba-9d82-4367-99ac-d1f63ec75372 |
   | ip_version           | 4                                    |
   | ipv6_address_mode    | None                                 |
   | ipv6_ra_mode         | None                                 |
   | name                 | subnet1                              |
   | network_id           | 5317a0bf-3df8-42e8-93c2-45134fb7b645 |
   | prefix_length        | None                                 |
   | project_id           | 37197271a1954ddb90207a95d5f46488     |
   | revision_number      | 0                                    |
   | segment_id           | None                                 |
   | service_types        |                                      |
   | subnetpool_id        | None                                 |
   | tags                 |                                      |
   | updated_at           | 2020-10-19T03:54:17Z                 |
   +----------------------+--------------------------------------+
   
   # 确认设置
   root@dlp ~(keystone)# openstack network list
   +--------------------------------------+------------+--------------------------------------+
   | ID                                   | Name       | Subnets                              |
   +--------------------------------------+------------+--------------------------------------+
   | 5317a0bf-3df8-42e8-93c2-45134fb7b645 | sharednet1 | fc5038ba-9d82-4367-99ac-d1f63ec75372 |
   +--------------------------------------+------------+--------------------------------------+
   
   root@dlp ~(keystone)# openstack subnet list
   +--------------------------------------+---------+--------------------------------------+-------------+
   | ID                                   | Name    | Network                              | Subnet      |
   +--------------------------------------+---------+--------------------------------------+-------------+
   | fc5038ba-9d82-4367-99ac-d1f63ec75372 | subnet1 | 5317a0bf-3df8-42e8-93c2-45134fb7b645 | 10.0.0.0/24 |
   +--------------------------------------+---------+--------------------------------------+-------------+
   ```

   