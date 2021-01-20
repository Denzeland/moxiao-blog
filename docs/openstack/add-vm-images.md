---
description: 在Ubuntu 20.04安装OpenStack Victoria，添加虚拟机镜像到Glance
date: 2021-01-20
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(五)：添加虚拟机镜像到Glance

```md
::: tip
在虚拟机上安装虚拟机需要开启嵌套虚拟机功能
:::
```

1. 创建ubuntu 20.04的虚拟机镜像

   ```shell
   # create a directory for disk image
   root@dlp ~(keystone)# mkdir -p /var/kvm/images
   # create a disk image
   root@dlp ~(keystone)# qemu-img create -f qcow2 /var/kvm/images/ubuntu2004.img 10G
   # install
   root@dlp ~(keystone)# virt-install \
   --name ubuntu2004 \
   --ram 2048 \
   --disk path=/var/kvm/images/ubuntu2004.img,format=qcow2 \
   --vcpus 2 \
   --os-type linux \
   --os-variant ubuntu20.04 \
   --network network=default \
   --graphics none \
   --console pty,target_type=serial \
   --location 'http://archive.ubuntu.com/ubuntu/dists/focal/main/installer-amd64/' \
   --extra-args 'console=ttyS0,115200n8 serial'
   Starting install...     # installation starts
   # after finishing installation, back to KVM Host and shutdown VM
   root@dlp ~(keystone)# virsh shutdown ubuntu2004
   # mount the disk image of the VM
   root@dlp ~(keystone)# guestmount -d ubuntu2004 -i /mnt
   # enable getty@ttyS0.service
   root@dlp ~(keystone)# ln -s /mnt/lib/systemd/system/getty@.service /mnt/etc/systemd/system/getty.target.wants/getty@ttyS0.service
   # unmount and start
   root@dlp ~(keystone)# umount /mnt
   root@dlp ~(keystone)# virsh start ubuntu2004 --console
   # configure some settings on GuestOS
   root@ubuntu:~# apt update
   root@ubuntu:~# apt -y install ssh cloud-init linux-virtual pollinate
   root@ubuntu:~# vi /etc/default/grub
   # line 10: change like follows
   GRUB_DEFAULT=0
   GRUB_HIDDEN_TIMEOUT=0
   GRUB_HIDDEN_TIMEOUT_QUIET=true
   GRUB_TIMEOUT=0
   GRUB_DISTRIBUTOR=`lsb_release -i -s 2> /dev/null || echo Debian`
   GRUB_CMDLINE_LINUX_DEFAULT="console=tty1 console=ttyS0"
   GRUB_CMDLINE_LINUX=""
   # line 34,35: comment out
   #GRUB_TERMINAL=serial
   #GRUB_SERIAL_COMMAND="serial --unit=0 --speed=115200 --word=8 --parity=no --stopp=1"
   root@ubuntu:~# update-grub
   root@ubuntu:~# vi /etc/cloud/cloud.cfg
   # line 13: add
   # only the case you'd like to allow SSH password authentication
   ssh_pwauth: true
   # line 94: change
   # only the case if you'd like to allow [ubuntu] user to use SSH password auth
   default_user:
       name: ubuntu
       lock_passwd: False
   root@ubuntu:~# systemctl enable serial-getty@ttyS0.service
   # shutdown to finish settings
   root@ubuntu:~# shutdown -h now
   ```

2. 添加镜像到Glance

   ```shell
   root@dlp ~(keystone)# openstack image create "Ubuntu2004" --file /var/kvm/images/ubuntu2004.img --disk-format qcow2 --container-format bare --public
   +------------------+------------------------------------------------------------+
   | Field            | Value                                                      |
   +------------------+------------------------------------------------------------+
   | container_format | bare                                                       |
   | created_at       | 2020-10-19T02:17:19Z                                       |
   | disk_format      | qcow2                                                      |
   | file             | /v2/images/7ba71e53-e270-4d2a-bbe9-0d642a6c019c/file       |
   | id               | 7ba71e53-e270-4d2a-bbe9-0d642a6c019c                       |
   | min_disk         | 0                                                          |
   | min_ram          | 0                                                          |
   | name             | Ubuntu2004                                                 |
   | owner            | b573c9e160864f028fc2d681a929f5af                           |
   | properties       | os_hidden='False', owner_specified.openstack.md5='', ..... |
   | protected        | False                                                      |
   | schema           | /v2/schemas/image                                          |
   | status           | queued                                                     |
   | tags             |                                                            |
   | updated_at       | 2020-10-19T02:17:19Z                                       |
   | visibility       | public                                                     |
   +------------------+------------------------------------------------------------+
   
   root@dlp ~(keystone)# openstack image list
   +--------------------------------------+------------+--------+
   | ID                                   | Name       | Status |
   +--------------------------------------+------------+--------+
   | 7ba71e53-e270-4d2a-bbe9-0d642a6c019c | Ubuntu2004 | active |
   +--------------------------------------+------------+--------+
   ```

3. 如果从网络下载镜像，也可以直接添加：

```shell
root@dlp ~(keystone)# wget http://cloud-images.ubuntu.com/releases/20.04/release/ubuntu-20.04-server-cloudimg-amd64.img -P /var/kvm/images
root@dlp ~(keystone)# openstack image create "Ubuntu2004-Official" --file /var/kvm/images/ubuntu-20.04-server-cloudimg-amd64.img --disk-format qcow2 --container-format bare --public
+------------------+----------------------------------------------------------------------------------------------+
| Field            | Value                                                                                        |
+------------------+----------------------------------------------------------------------------------------------+
| checksum         | be096b5b3c1a28f9416deed0253ad3e2                                                             |
| container_format | bare                                                                                         |
| created_at       | 2020-06-04T03:43:24Z                                                                         |
| disk_format      | qcow2                                                                                        |
| file             | /v2/images/ecfb5b90-eb90-436e-b853-16ede5f55bda/file                                         |
| id               | ecfb5b90-eb90-436e-b853-16ede5f55bda                                                         |
| min_disk         | 0                                                                                            |
| min_ram          | 0                                                                                            |
| name             | Ubuntu2004-Official                                                                          |
| owner            | 3227cdd34d5c4d9c97eeb8f0dfdf5d0e                                                             |
| properties       | os_hash_algo='sha512', os_hash_value='1cbc97f05e9de86ea571dd154b855dd217de51905367e9599c1... |
| protected        | False                                                                                        |
| schema           | /v2/schemas/image                                                                            |
| size             | 533856256                                                                                    |
| status           | active                                                                                       |
| tags             |                                                                                              |
| updated_at       | 2020-06-04T03:43:27Z                                                                         |
| visibility       | public                                                                                       |
+------------------+----------------------------------------------------------------------------------------------+
```

