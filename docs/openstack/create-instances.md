---
description: 在Ubuntu 20.04安装OpenStack Victoria，创建并运行一个虚拟机实例
date: 2021-01-21
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(十)：创建运行实例

::: tip
这里也可以不用在命令行创建实例，我当时运行这一步创建实例失败，后面是通过在web看板创建的实例
:::

1. 首先虚拟机切换到普通用户，并创建一个配置文件，导出Keystyone需要的验证信息系统变量，然后创建并运行实例

```shell
ubuntu@dlp:~$ vi ~/keystonerc
export OS_PROJECT_DOMAIN_NAME=default
export OS_USER_DOMAIN_NAME=default
export OS_PROJECT_NAME=harry
export OS_USERNAME=hary
export OS_PASSWORD=123456
export OS_AUTH_URL=http://192.168.56.102:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
export PS1='\u@\h \W(keystone)\$ '
ubuntu@dlp:~$ chmod 600 ~/keystonerc
ubuntu@dlp:~$ source ~/keystonerc
ubuntu@dlp ~(keystone)$ echo "source ~/keystonerc " >> ~/.bash_profile
# confirm available [flavor] list
ubuntu@dlp ~(keystone)$ openstack flavor list
+----+----------+------+------+-----------+-------+-----------+
| ID | Name     |  RAM | Disk | Ephemeral | VCPUs | Is Public |
+----+----------+------+------+-----------+-------+-----------+
| 0  | m1.small | 2048 |   10 |         0 |     1 | True      |
+----+----------+------+------+-----------+-------+-----------+

# confirm available image list
ubuntu@dlp ~(keystone)$ openstack image list
+--------------------------------------+------------+--------+
| ID                                   | Name       | Status |
+--------------------------------------+------------+--------+
| 7ba71e53-e270-4d2a-bbe9-0d642a6c019c | Ubuntu2004 | active |
+--------------------------------------+------------+--------+

# confirm available network list
ubuntu@dlp ~(keystone)$ openstack network list
+--------------------------------------+------------+--------------------------------------+
| ID                                   | Name       | Subnets                              |
+--------------------------------------+------------+--------------------------------------+
| 5317a0bf-3df8-42e8-93c2-45134fb7b645 | sharednet1 | fc5038ba-9d82-4367-99ac-d1f63ec75372 |
+--------------------------------------+------------+--------------------------------------+

# create a security group for instances
ubuntu@dlp ~(keystone)$ openstack security group create secgroup01
+-----------------+---------------------------------------------------------------------------+
| Field           | Value                                                                     |
+-----------------+---------------------------------------------------------------------------+
| created_at      | 2020-10-19T03:57:03Z                                                      |
| description     | secgroup01                                                                |
| id              | 4605d55c-fa18-4db7-b83a-04b2c4b7a8b0                                      |
| name            | secgroup01                                                                |
| project_id      | 6c44eafd4f614985bf74b94f2aee82fb                                          |
| revision_number | 1                                                                         |
| rules           | created_at='2020-10-19T03:57:03Z', direction='egress', ethertype='IPv4'.. |
|                 | created_at='2020-10-19T03:57:03Z', direction='egress', ethertype='IPv6'.. |
| stateful        | True                                                                      |
| tags            | []                                                                        |
| updated_at      | 2020-10-19T03:57:03Z                                                      |
+-----------------+---------------------------------------------------------------------------+

ubuntu@dlp ~(keystone)$ openstack security group list
+--------------------------------------+------------+------------------------+----------------------------------+------+
| ID                                   | Name       | Description            | Project                          | Tags |
+--------------------------------------+------------+------------------------+----------------------------------+------+
| 31608094-7179-4ba2-a0cd-8eeeae8fad93 | default    | Default security group | 6c44eafd4f614985bf74b94f2aee82fb | []   |
| 4605d55c-fa18-4db7-b83a-04b2c4b7a8b0 | secgroup01 | secgroup01             | 6c44eafd4f614985bf74b94f2aee82fb | []   |
+--------------------------------------+------------+------------------------+----------------------------------+------+

# create a SSH keypair for connecting to instances
ubuntu@dlp ~(keystone)$ ssh-keygen -q -N ""
Enter file in which to save the key (/home/ubuntu/.ssh/id_rsa):
# add public-key
ubuntu@dlp ~(keystone)$ openstack keypair create --public-key ~/.ssh/id_rsa.pub mykey
+-------------+-------------------------------------------------+
| Field       | Value                                           |
+-------------+-------------------------------------------------+
| fingerprint | 5f:e1:21:df:68:74:0c:ef:f0:12:55:ba:bb:a6:cd:47 |
| name        | mykey                                           |
| user_id     | a13cfae0e5eb466fae71a636a6ffb6b4                |
+-------------+-------------------------------------------------+

ubuntu@dlp ~(keystone)$ openstack keypair list
+-------+-------------------------------------------------+
| Name  | Fingerprint                                     |
+-------+-------------------------------------------------+
| mykey | 5f:e1:21:df:68:74:0c:ef:f0:12:55:ba:bb:a6:cd:47 |
+-------+-------------------------------------------------+

ubuntu@dlp ~(keystone)$ netID=$(openstack network list | grep sharednet1 | awk '{ print $2 }')
# create and boot an instance
ubuntu@dlp ~(keystone)$ openstack server create --flavor m1.small --image Ubuntu2004 --security-group secgroup01 --nic net-id=$netID --key-name mykey Ubuntu_2004
+-----------------------------+---------------------------------------------------+
| Field                       | Value                                             |
+-----------------------------+---------------------------------------------------+
| OS-DCF:diskConfig           | MANUAL                                            |
| OS-EXT-AZ:availability_zone |                                                   |
| OS-EXT-STS:power_state      | NOSTATE                                           |
| OS-EXT-STS:task_state       | scheduling                                        |
| OS-EXT-STS:vm_state         | building                                          |
| OS-SRV-USG:launched_at      | None                                              |
| OS-SRV-USG:terminated_at    | None                                              |
| accessIPv4                  |                                                   |
| accessIPv6                  |                                                   |
| addresses                   |                                                   |
| adminPass                   | 2E9dutBkSRrm                                      |
| config_drive                |                                                   |
| created                     | 2020-10-19T04:07:15Z                              |
| flavor                      | m1.small (0)                                      |
| hostId                      |                                                   |
| id                          | 939512a9-3556-4fd5-882a-bc6c18d3bb6d              |
| image                       | Ubuntu2004 (7ba71e53-e270-4d2a-bbe9-0d642a6c019c) |
| key_name                    | mykey                                             |
| name                        | Ubuntu_2004                                       |
| progress                    | 0                                                 |
| project_id                  | 6c44eafd4f614985bf74b94f2aee82fb                  |
| properties                  |                                                   |
| security_groups             | name='4605d55c-fa18-4db7-b83a-04b2c4b7a8b0'       |
| status                      | BUILD                                             |
| updated                     | 2020-10-19T04:07:15Z                              |
| user_id                     | a13cfae0e5eb466fae71a636a6ffb6b4                  |
| volumes_attached            |                                                   |
+-----------------------------+---------------------------------------------------+

# show status ([BUILD] status is shown when building instance)
ubuntu@dlp ~(keystone)$ openstack server list
+--------------------------------------+-------------+--------+----------+------------+----------+
| ID                                   | Name        | Status | Networks | Image      | Flavor   |
+--------------------------------------+-------------+--------+----------+------------+----------+
| 939512a9-3556-4fd5-882a-bc6c18d3bb6d | Ubuntu_2004 | BUILD  |          | Ubuntu2004 | m1.small |
+--------------------------------------+-------------+--------+----------+------------+----------+

# when starting noramlly, the status turns to [ACTIVE]
ubuntu@dlp ~(keystone)$ openstack server list
+--------------------------------------+-------------+--------+-----------------------+------------+----------+
| ID                                   | Name        | Status | Networks              | Image      | Flavor   |
+--------------------------------------+-------------+--------+-----------------------+------------+----------+
| 939512a9-3556-4fd5-882a-bc6c18d3bb6d | Ubuntu_2004 | ACTIVE | sharednet1=10.0.4.220 | Ubuntu2004 | m1.small |
+--------------------------------------+-------------+--------+-----------------------+------------+----------+
```

2. 配置上一步创建的安全组的安全设置，允许SSH和ICMP连接

```shell
# permit ICMP
ubuntu@dlp ~(keystone)$ openstack security group rule create --protocol icmp --ingress secgroup01
+-------------------+--------------------------------------+
| Field             | Value                                |
+-------------------+--------------------------------------+
| created_at        | 2020-10-19T04:13:31Z                 |
| description       |                                      |
| direction         | ingress                              |
| ether_type        | IPv4                                 |
| id                | 03abaacf-9585-423d-911c-cc7ce4048bab |
| name              | None                                 |
| port_range_max    | None                                 |
| port_range_min    | None                                 |
| project_id        | 6c44eafd4f614985bf74b94f2aee82fb     |
| protocol          | icmp                                 |
| remote_group_id   | None                                 |
| remote_ip_prefix  | 0.0.0.0/0                            |
| revision_number   | 0                                    |
| security_group_id | 4605d55c-fa18-4db7-b83a-04b2c4b7a8b0 |
| tags              | []                                   |
| updated_at        | 2020-10-19T04:13:31Z                 |
+-------------------+--------------------------------------+

# permit SSH
ubuntu@dlp ~(keystone)$ openstack security group rule create --protocol tcp --dst-port 22:22 secgroup01
+-------------------+--------------------------------------+
| Field             | Value                                |
+-------------------+--------------------------------------+
| created_at        | 2020-10-19T04:13:47Z                 |
| description       |                                      |
| direction         | ingress                              |
| ether_type        | IPv4                                 |
| id                | 98789c7c-715d-463b-a129-f628dd91a214 |
| name              | None                                 |
| port_range_max    | 22                                   |
| port_range_min    | 22                                   |
| project_id        | 6c44eafd4f614985bf74b94f2aee82fb     |
| protocol          | tcp                                  |
| remote_group_id   | None                                 |
| remote_ip_prefix  | 0.0.0.0/0                            |
| revision_number   | 0                                    |
| security_group_id | 4605d55c-fa18-4db7-b83a-04b2c4b7a8b0 |
| tags              | []                                   |
| updated_at        | 2020-10-19T04:13:47Z                 |
+-------------------+--------------------------------------+

ubuntu@dlp ~(keystone)$ openstack security group rule list
+--------------------------------------+-------------+-----------+-----------+------------+--------------------------------------+--------------------------------------+
| ID                                   | IP Protocol | Ethertype | IP Range  | Port Range | Remote Security Group                | Security Group                       |
+--------------------------------------+-------------+-----------+-----------+------------+--------------------------------------+--------------------------------------+
| 03abaacf-9585-423d-911c-cc7ce4048bab | icmp        | IPv4      | 0.0.0.0/0 |            | None                                 | 4605d55c-fa18-4db7-b83a-04b2c4b7a8b0 |
| 15fd8b16-821e-45ac-a675-7ae38f4a19c6 | None        | IPv4      | 0.0.0.0/0 |            | 31608094-7179-4ba2-a0cd-8eeeae8fad93 | 31608094-7179-4ba2-a0cd-8eeeae8fad93 |
| 276dbed6-329f-415d-8280-a11db3c1cb39 | None        | IPv6      | ::/0      |            | None                                 | 31608094-7179-4ba2-a0cd-8eeeae8fad93 |
| 324efbf2-aa3e-4092-96de-b46ca7f0cd95 | None        | IPv6      | ::/0      |            | 31608094-7179-4ba2-a0cd-8eeeae8fad93 | 31608094-7179-4ba2-a0cd-8eeeae8fad93 |
| 759b60e3-2240-407e-aebc-5fe6f521db75 | None        | IPv4      | 0.0.0.0/0 |            | None                                 | 4605d55c-fa18-4db7-b83a-04b2c4b7a8b0 |
| 98789c7c-715d-463b-a129-f628dd91a214 | tcp         | IPv4      | 0.0.0.0/0 | 22:22      | None                                 | 4605d55c-fa18-4db7-b83a-04b2c4b7a8b0 |
| 9b9b61ba-3609-4d77-9908-a3fbb223007d | None        | IPv4      | 0.0.0.0/0 |            | None                                 | 31608094-7179-4ba2-a0cd-8eeeae8fad93 |
| da856ad7-e581-41f3-8b15-d266e398c21a | None        | IPv6      | ::/0      |            | None                                 | 4605d55c-fa18-4db7-b83a-04b2c4b7a8b0 |
+--------------------------------------+-------------+-----------+-----------+------------+--------------------------------------+--------------------------------------+
```

3. 使用SSH登录到实例

   ```shell
   ubuntu@dlp ~(keystone)$ openstack server list
   +--------------------------------------+-------------+--------+-----------------------+------------+----------+
   | ID                                   | Name        | Status | Networks              | Image      | Flavor   |
   +--------------------------------------+-------------+--------+-----------------------+------------+----------+
   | 939512a9-3556-4fd5-882a-bc6c18d3bb6d | Ubuntu_2004 | ACTIVE | sharednet1=10.0.4.220 | Ubuntu2004 | m1.small |
   +--------------------------------------+-------------+--------+-----------------------+------------+----------+
   
   ubuntu@dlp ~(keystone)$ ping 10.0.4.220 -c3
   PING 10.0.4.220 (10.0.4.220) 56(84) bytes of data.
   64 bytes from 10.0.4.220: icmp_seq=1 ttl=64 time=1.58 ms
   64 bytes from 10.0.4.220: icmp_seq=2 ttl=64 time=0.669 ms
   64 bytes from 10.0.4.220: icmp_seq=3 ttl=64 time=0.637 ms
   
   --- 10.0.4.220 ping statistics ---
   3 packets transmitted, 3 received, 0% packet loss, time 2025ms
   rtt min/avg/max/mdev = 0.637/0.963/1.584/0.439 ms
   
   ubuntu@dlp ~(keystone)$ ssh ubuntu@10.0.4.220
   The authenticity of host '10.0.4.220 (10.0.4.220)' can't be established.
   ECDSA key fingerprint is SHA256:0lQJDQg+yRQVQJnF3SMIVhEVlWsO3RfMycKL73Y8hec.
   Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
   Warning: Permanently added '10.0.4.220' (ECDSA) to the list of known hosts.
   Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-51-generic x86_64)
   
    * Documentation:  https://help.ubuntu.com
    * Management:     https://landscape.canonical.com
    * Support:        https://ubuntu.com/advantage
   Last login: Mon Oct 19 19:14:01 2020
   
   ubuntu@ubuntu-2004:~$     # logined
   ```

   4. 可以在命令行使用openstack命令运行或停止实例

      ```shell
      ubuntu@dlp ~(keystone)$ openstack server list
      +--------------------------------------+-------------+--------+-----------------------+------------+----------+
      | ID                                   | Name        | Status | Networks              | Image      | Flavor   |
      +--------------------------------------+-------------+--------+-----------------------+------------+----------+
      | 939512a9-3556-4fd5-882a-bc6c18d3bb6d | Ubuntu_2004 | ACTIVE | sharednet1=10.0.0.220 | Ubuntu2004 | m1.small |
      +--------------------------------------+-------------+--------+-----------------------+------------+----------+
      
      # stop instance
      ubuntu@dlp ~(keystone)$ openstack server stop Ubuntu_2004
      ubuntu@dlp ~(keystone)$ openstack server list
      +--------------------------------------+-------------+---------+-----------------------+------------+----------+
      | ID                                   | Name        | Status  | Networks              | Image      | Flavor   |
      +--------------------------------------+-------------+---------+-----------------------+------------+----------+
      | 939512a9-3556-4fd5-882a-bc6c18d3bb6d | Ubuntu_2004 | SHUTOFF | sharednet1=10.0.0.220 | Ubuntu2004 | m1.small |
      +--------------------------------------+-------------+---------+-----------------------+------------+----------+
      
      # start instance
      ubuntu@dlp ~(keystone)$ openstack server start Ubuntu_2004
      ubuntu@dlp ~(keystone)$ openstack server list
      +--------------------------------------+-------------+--------+-----------------------+------------+----------+
      | ID                                   | Name        | Status | Networks              | Image      | Flavor   |
      +--------------------------------------+-------------+--------+-----------------------+------------+----------+
      | 939512a9-3556-4fd5-882a-bc6c18d3bb6d | Ubuntu_2004 | ACTIVE | sharednet1=10.0.0.220 | Ubuntu2004 | m1.small |
      +--------------------------------------+-------------+--------+-----------------------+------------+----------+
      ```

5. 也可以通过浏览器获得VNC控制台

   ```shell
   ubuntu@dlp ~(keystone)$ openstack server list
   +--------------------------------------+-------------+--------+-----------------------+------------+----------+
   | ID                                   | Name        | Status | Networks              | Image      | Flavor   |
   +--------------------------------------+-------------+--------+-----------------------+------------+----------+
   | 939512a9-3556-4fd5-882a-bc6c18d3bb6d | Ubuntu_2004 | ACTIVE | sharednet1=10.0.0.220 | Ubuntu2004 | m1.small |
   +--------------------------------------+-------------+--------+-----------------------+------------+----------+
   
   ubuntu@dlp ~(keystone)$ openstack console url show Ubuntu_2004
   +-------+------------------------------------------------------------------------------------------+
   | Field | Value                                                                                    |
   +-------+------------------------------------------------------------------------------------------+
   | type  | novnc                                                                                    |
   | url   | http://10.0.0.30:6080/vnc_auto.html?path=%3Ftoken%3Dc9726d96-6908-4409-98f4-002c362c1042 |
   +-------+------------------------------------------------------------------------------------------+
   ```

