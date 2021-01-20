---
description: 在Ubuntu 20.04安装OpenStack Victoria，OpenStack安装前的环境准备
date: 2021-01-20
sidebar: 'auto'
categories:
 - 拨荆集录
tags:
 - OpenStack
---

# Ubuntu 20.04安装OpenStack(二)：环境准备

有一些组件需要需要一些通用的服务，这里主要包含NTP服务，MariaDB，RabbitMQ和Memcached，下面的例子是ubuntu虚拟机的环境：

eth0|192.168.56.102
+-----------+-----------+
|    [ 计算节点 ]   |
|                       |
|  MariaDB    RabbitMQ  |
|  Memcached            |
+-----------------------+

1. 安装NTP服务调整日期，安装配置Chrony

```sh
root@dlp:~# apt -y install chrony
root@dlp:~# vi /etc/chrony/chrony.conf
# line 17: comment out default settings and add NTP Servers for your timezone
#pool ntp.ubuntu.com        iburst maxsources 4
#pool 0.ubuntu.pool.ntp.org iburst maxsources 1
#pool 1.ubuntu.pool.ntp.org iburst maxsources 1
#pool 2.ubuntu.pool.ntp.org iburst maxsources 2
pool ntp.nict.jp iburst 

# add to the end : add network range you allow to receive time syncing requests from clients
allow 10.0.0.0/24
root@dlp:~# systemctl restart chrony
# show status
root@dlp:~# chronyc sources
210 Number of sources = 4
MS Name/IP address         Stratum Poll Reach LastRx Last sample
===============================================================================
^- ntp-b3.nict.go.jp             1   6    17     6  -1507us[-1507us] +/- 9821us
^* ntp-a2.nict.go.jp             1   6    17     7    -45us[ +912us] +/- 8983us
^- ntp-b2.nict.go.jp             1   6    17     6  -1030us[-1030us] +/- 9922us
^- 61.205.120.130                1   6    17     6   -975us[ -975us] +/- 5933us
```

2. 安装MariaDB

   ```shell
   root@www:~# apt -y install mariadb-server
   root@www:~# vi /etc/mysql/mariadb.conf.d/50-server.cnf
   # line 104: confirm default charaset
   # if use 4 bytes UTF-8, specify [utf8mb4]
   character-set-server  = utf8mb4
   collation-server      = utf8mb4_general_ci
   
   root@www:~# systemctl restart mariadb
   ```

3. 初始化MariaDB的设置

   ```shell
   root@www:~# mysql_secure_installation
   
   NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
         SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!
   
   In order to log into MariaDB to secure it, we'll need the current
   password for the root user.  If you've just installed MariaDB, and
   you haven't set the root password yet, the password will be blank,
   so you should just press enter here.
   
   Enter current password for root (enter for none):
   OK, successfully used password, moving on...
   
   Setting the root password ensures that nobody can log into the MariaDB
   root user without the proper authorisation.
   
   # set root password
   Set root password? [Y/n] y
   New password:
   Re-enter new password:
   Password updated successfully!
   Reloading privilege tables..
    ... Success!
   
   
   By default, a MariaDB installation has an anonymous user, allowing anyone
   to log into MariaDB without having to have a user account created for
   them.  This is intended only for testing, and to make the installation
   go a bit smoother.  You should remove them before moving into a
   production environment.
   
   # remove anonymous users
   Remove anonymous users? [Y/n] y
    ... Success!
   
   Normally, root should only be allowed to connect from 'localhost'.  This
   ensures that someone cannot guess at the root password from the network.
   
   # disallow root login remotely
   Disallow root login remotely? [Y/n] y
    ... Success!
   
   By default, MariaDB comes with a database named 'test' that anyone can
   access.  This is also intended only for testing, and should be removed
   before moving into a production environment.
   
   # remove test database
   Remove test database and access to it? [Y/n] y
    - Dropping test database...
    ... Success!
    - Removing privileges on test database...
    ... Success!
   
   Reloading the privilege tables will ensure that all changes made so far
   will take effect immediately.
   
   # reload privilege tables
   Reload privilege tables now? [Y/n] y
    ... Success!
   
   Cleaning up...
   
   All done!  If you've completed all of the above steps, your MariaDB
   installation should now be secure.
   
   Thanks for using MariaDB!
   
   # connect to MariaDB with root
   # [Unix_Socket] authentication is default
   root@www:~# mysql
   Welcome to the MariaDB monitor.  Commands end with ; or \g.
   Your MariaDB connection id is 62
   Server version: 10.3.22-MariaDB-1ubuntu1 Ubuntu 20.04
   
   Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   # [Unix_Socket] authentication is default like follows
   MariaDB [(none)]> show grants for root@localhost; 
   +--------------------------------------------------------------------------------------------------------------------------------------------------+
   | Grants for root@localhost                                                                                                                        |
   +--------------------------------------------------------------------------------------------------------------------------------------------------+
   | GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED VIA unix_socket USING '*2470C0C06DEE42FD1618BB99005ADCA2EC9D1E19' WITH GRANT OPTION |
   | GRANT PROXY ON ''@'%' TO 'root'@'localhost' WITH GRANT OPTION                                                                                    |
   +--------------------------------------------------------------------------------------------------------------------------------------------------+
   2 rows in set (0.000 sec)
   
   # show user list
   MariaDB [(none)]> select user,host,password from mysql.user; 
   +------+-----------+-------------------------------------------+
   | user | host      | password                                  |
   +------+-----------+-------------------------------------------+
   | root | localhost | *xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
   +------+-----------+-------------------------------------------+
   1 row in set (0.001 sec)
   
   # show database list
   MariaDB [(none)]> show databases; 
   +--------------------+
   | Database           |
   +--------------------+
   | information_schema |
   | mysql              |
   | performance_schema |
   +--------------------+
   3 rows in set (0.001 sec)
   
   # create test database
   MariaDB [(none)]> create database test_database; 
   Query OK, 1 row affected (0.000 sec)
   
   # create test table on test database
   MariaDB [(none)]> create table test_database.test_table (id int, name varchar(50), address varchar(50), primary key (id)); 
   Query OK, 0 rows affected (0.108 sec)
   
   # insert data to test table
   MariaDB [(none)]> insert into test_database.test_table(id, name, address) values("001", "Ubuntu", "Hiroshima"); 
   Query OK, 1 row affected (0.036 sec)
   
   # show test table
   MariaDB [(none)]> select * from test_database.test_table; 
   +----+--------+-----------+
   | id | name   | address   |
   +----+--------+-----------+
   |  1 | Ubuntu | Hiroshima |
   +----+--------+-----------+
   1 row in set (0.001 sec)
   
   # delete test database
   MariaDB [(none)]> drop database test_database; 
   Query OK, 1 row affected (0.111 sec)
   
   MariaDB [(none)]> exit
   Bye
   ```

4. 配置 Openstack Victoria仓库

   ```shell
   root@dlp:~# apt -y install software-properties-common
   root@dlp:~# add-apt-repository cloud-archive:victoria
   root@dlp:~# apt update
   root@dlp:~# apt -y upgrade
   ```

5. 安装RabbitMQ, Memcached

   ```shell
   root@dlp:~# apt -y install rabbitmq-server memcached python3-pymysql
   # add a user
   # set any password for [password]
   root@dlp:~# rabbitmqctl add_user openstack password
   Creating user "openstack" ...
   root@dlp:~# rabbitmqctl set_permissions openstack ".*" ".*" ".*"
   Setting permissions for user "openstack" in vhost "/" ...
   root@dlp:~# vi /etc/mysql/mariadb.conf.d/50-server.cnf
   # line 28: change
   bind-address = 0.0.0.0
   # line 40: uncomment and change
   # default value 151 is not enough on Openstack Env
   max_connections = 500
   root@dlp:~# vi /etc/memcached.conf
   # line 35: change
   -l 0.0.0.0
   root@dlp:~# systemctl restart mariadb rabbitmq-server memcached
   ```