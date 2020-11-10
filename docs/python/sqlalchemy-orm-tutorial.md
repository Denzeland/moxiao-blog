---
title: SQLAlchemy ORM API基础概览
description: 本文是SQLAlchemy高级抽象层ORM的中文教程，也是对SQLAlchemy官方文档学习的一个总结
date: 2020-11-06
sidebar: 'auto'
categories:
 - python集录
tags:
 - python
 - SQLAlchemy
---

> 这篇文档是我对官方文档学习理解后的一个整理记录，以供自己查询，[原文地址](https://docs.sqlalchemy.org/en/14/orm/tutorial.html)

ORM是SQLAlchemy最高级别的抽象API， 这里基于1.4版本，全面的描述SQLAlchemy ORM的各个方面， 涵盖了定义类的映射， 创建Session，CRUD操作， 事务，表之间的关系，连接查询等ORM API包括的所有内容， 掌握这些内容，可以很轻松的在应用中使用SQLAlchemy ORM API。

## 声明类的映射

SQLAlchemy类的映射使用声明式系统，所有的类都是根据基类定义的，基类也被成为成为声明式基类， 下面是基类的定义和映射的类的定义：

```python
>>> from sqlalchemy.orm import declarative_base

>>> Base = declarative_base()
>>> from sqlalchemy import Column, Integer, String
>>> class User(Base):
...     __tablename__ = 'users'
...
...     id = Column(Integer, primary_key=True)
...     name = Column(String)
...     fullname = Column(String)
...     nickname = Column(String)
...
...     def __repr__(self):
...        return "<User(name='%s', fullname='%s', nickname='%s')>" % (
...                             self.name, self.fullname, self.nickname)
```

每个定义的类会映射到数据库中的一张表， 类的实例映射到表中的一行记录，上面的类定义了表的名称，列的名称和数据类型，**一个类至少需要__tablename__属性和至少一个主键列**

## 创建模式

上面声明一个类之后，SQLAlchemy声明系统实际上在背后使用python元类创建了一个 [`Table`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Table) 对象，并通过实例化[`Mapper`](https://docs.sqlalchemy.org/en/14/orm/mapping_api.html#sqlalchemy.orm.Mapper)类，将它和这个类关联起来。 [`Table`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Table) 是[`MetaData`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.MetaData)集合的成员， [`MetaData`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.MetaData)是一个注册表， 具有向数据库发出生成一系列模式的命令能力， 下面的代码将创建数据库表users：

```python
>>> Base.metadata.create_all(engine)
BEGIN...
CREATE TABLE users (
    id INTEGER NOT NULL,
    name VARCHAR,
    fullname VARCHAR,
    nickname VARCHAR,
    PRIMARY KEY (id)
)
[...] ()
COMMIT
```

::: tip 不同数据库差异
有的数据库要求指定String类型列的长度， 有的数据库要求根据序列生成主键， 因此下面是一个比较完整的定义：

```python
from sqlalchemy import Sequence
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, Sequence('user_id_seq'), primary_key=True)
    name = Column(String(50))
    fullname = Column(String(50))
    nickname = Column(String(50))

    def __repr__(self):
        return "<User(name='%s', fullname='%s', nickname='%s')>" % (
                                self.name, self.fullname, self.nickname)
```

:::

## 创建类的实例

实例化类时，使用类的属性作为关键字参数：

```python
>>> ed_user = User(name='ed', fullname='Ed Jones', nickname='edsnickname')
>>> ed_user.name
'ed'
>>> ed_user.nickname
'edsnickname'
>>> str(ed_user.id)
'None'
```

## 创建Session

ORM对数据库的“句柄”是Session，Session对象可以创建时绑定[`Engine`](https://docs.sqlalchemy.org/en/14/core/connections.html#sqlalchemy.engine.Engine)，也可以先创建，后通过配置绑定：

```python
>>> from sqlalchemy.orm import sessionmaker
>>> Session = sessionmaker(bind=engine)
```

```python
>>> Session = sessionmaker()
>>> Session.configure(bind=engine)
```

每当需要与数据库对话时，实例化一个会话:

```python
>>> session = Session()
```

上面的Session还没有打开任何连接。当它第一次被使用时，它从引擎维护的连接池中检索一个连接，并一直保存它，直到我们提交所有更改和/或关闭会话对象。

## 添加和更新对象

为持久化User对象， 使用[`Session.add()`](https://docs.sqlalchemy.org/en/14/orm/session_api.html#sqlalchemy.orm.Session.add) 添加到`Session`:

```python
>>> ed_user = User(name='ed', fullname='Ed Jones', nickname='edsnickname')
>>> session.add(ed_user)
```

此时实例的状态为**pending**，并没有触发sql语句到数据库， 直到提交了事务才会实际更改数据库。ORM使用[标识映射](https://docs.sqlalchemy.org/en/14/glossary.html#term-identity-map)来追踪内部对象的修改，比如下面查询返回的对象和之前添加的对象是同一个对象：

```python
>>> our_user = session.query(User).filter_by(name='ed').first() 
>>> our_user
<User(name='ed', fullname='Ed Jones', nickname='edsnickname')>
>>> ed_user is our_user
True
```

一次添加多个对象使用`add_all()`:

```python
>>> session.add_all([
...     User(name='wendy', fullname='Wendy Williams', nickname='windy'),
...     User(name='mary', fullname='Mary Contrary', nickname='mary'),
...     User(name='fred', fullname='Fred Flintstone', nickname='freddy')])
```

修改对象，以及查询被修改的对象：

```python
>>> ed_user.nickname = 'eddie'
>>> session.dirty
IdentitySet([<User(name='ed', fullname='Ed Jones', nickname='eddie')>])
>>> session.new  
IdentitySet([<User(name='wendy', fullname='Wendy Williams', nickname='windy')>,
<User(name='mary', fullname='Mary Contrary', nickname='mary')>,
<User(name='fred', fullname='Fred Flintstone', nickname='freddy')>])
```

提交事务：

```python
>>> session.commit()
```

[`Session.commit()`](https://docs.sqlalchemy.org/en/14/orm/session_api.html#sqlalchemy.orm.Session.commit)刷新更改到数据库， 会话引用的连接资源会返回到连接池。

## 回滚

现在修改之前的一个用户，并添加一个错误的用户， 最后用`session.rollback()`回滚：

```python
>>> ed_user.name = 'Edwardo'
>>> fake_user = User(name='fakeuser', fullname='Invalid', nickname='12345')
>>> session.add(fake_user)
>>> session.query(User).filter(User.name.in_(['Edwardo', 'fakeuser'])).all()
[<User(name='Edwardo', fullname='Ed Jones', nickname='eddie')>, <User(name='fakeuser', fullname='Invalid', nickname='12345')>]

>>> session.rollback()

>>> ed_user.name
u'ed'
>>> fake_user in session
False

>>> session.query(User).filter(User.name.in_(['ed', 'fakeuser'])).all()
[<User(name='ed', fullname='Ed Jones', nickname='eddie')>]

```

## 查询

 `Query`对象是在`Session`对象调用`query()`方法得到的， `query()`方法接受数量可变的参数，包括类或者类的描述符，看下面例子：

```python
>>> for instance in session.query(User).order_by(User.id):
...     print(instance.name, instance.fullname)
ed Ed Jones
wendy Wendy Williams
mary Mary Contrary
fred Fred Flintstone
```

当多个类实体或基于列的实体被表示为query()函数的参数时，返回的结果被表示为元组:

```python
>>> for name, fullname in session.query(User.name, User.fullname):
...     print(name, fullname)
ed Ed Jones
wendy Wendy Williams
mary Mary Contrary
fred Fred Flintstone

>>> for row in session.query(User, User.name).all():
...    print(row.User, row.name)
<User(name='ed', fullname='Ed Jones', nickname='eddie')> ed
<User(name='wendy', fullname='Wendy Williams', nickname='windy')> wendy
<User(name='mary', fullname='Mary Contrary', nickname='mary')> mary
<User(name='fred', fullname='Fred Flintstone', nickname='freddy')> fred
```

还可以使用[`ColumnElement.label()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnElement.label)控制列的名称：

```python
>>> for row in session.query(User.name.label('name_label')).all():
...    print(row.name_label)
ed
wendy
mary
fred
```

还可以给类对象定义别名：

```python
>>> from sqlalchemy.orm import aliased
>>> user_alias = aliased(User, name='user_alias')

SQL>>> for row in session.query(user_alias, user_alias.name).all():
...    print(row.user_alias)
<User(name='ed', fullname='Ed Jones', nickname='eddie')>
<User(name='wendy', fullname='Wendy Williams', nickname='windy')>
<User(name='mary', fullname='Mary Contrary', nickname='mary')>
<User(name='fred', fullname='Fred Flintstone', nickname='freddy')>
```

使用数组切片实现LIMIT和OFFSET：

```python
>>> for u in session.query(User).order_by(User.id)[1:3]:
...    print(u)
<User(name='wendy', fullname='Wendy Williams', nickname='windy')>
<User(name='mary', fullname='Mary Contrary', nickname='mary')>
```

使用filter_by()过滤结果：

```python
>>> for name, in session.query(User.name).filter_by(fullname='Ed Jones'):
    print(name)
ed
```

多个条件使用AND连接：

```python
>>> for user in session.query(User).\
...          filter(User.name=='ed').\
...          filter(User.fullname=='Ed Jones'):
...    print(user)
<User(name='ed', fullname='Ed Jones', nickname='eddie')>
```

### 常见的过滤运算符

- [`ColumnOperators.__eq__()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.__eq__):

```python
query.filter(User.name == 'ed')
```

- [`ColumnOperators.__ne__()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.__ne__):

```python
query.filter(User.name != 'ed')
```

- [`ColumnOperators.like()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.like):

```python
query.filter(User.name.like('%ed%'))
```

- [`ColumnOperators.ilike()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.ilike)

```python
query.filter(User.name.ilike('%ed%'))
```

- [`ColumnOperators.in_()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.in_):

```python
query.filter(User.name.in_(['ed', 'wendy', 'jack']))

# works with query objects too:
query.filter(User.name.in_(
    session.query(User.name).filter(User.name.like('%ed%'))
))

# use tuple_() for composite (multi-column) queries
from sqlalchemy import tuple_
query.filter(
    tuple_(User.name, User.nickname).\
    in_([('ed', 'edsnickname'), ('wendy', 'windy')])
)
```

- [`ColumnOperators.not_in()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.not_in):

  ```python
  query.filter(~User.name.in_(['ed', 'wendy', 'jack']))
  ```

- [`ColumnOperators.is_()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.is_):

```python
query.filter(User.name == None)

# alternatively, if pep8/linters are a concern
query.filter(User.name.is_(None))
```

- [`ColumnOperators.is_not()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.is_not):

```python
query.filter(User.name != None)

# alternatively, if pep8/linters are a concern
query.filter(User.name.is_not(None))
```

- [`and_()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.and_):

```python
# use and_()
from sqlalchemy import and_
query.filter(and_(User.name == 'ed', User.fullname == 'Ed Jones'))

# or send multiple expressions to .filter()
query.filter(User.name == 'ed', User.fullname == 'Ed Jones')

# or chain multiple filter()/filter_by() calls
query.filter(User.name == 'ed').filter(User.fullname == 'Ed Jones')
```

- [`or_()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.or_):

```python
from sqlalchemy import or_
query.filter(or_(User.name == 'ed', User.name == 'wendy'))
```

- [`ColumnOperators.match()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.ColumnOperators.match):

```python
query.filter(User.name.match('wendy'))
```

### 返回列表或者标量

[`Query.all()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.all)返回列表，返回结果去除了重复的值:

```python
>>> query = session.query(User).filter(User.name.like('%ed')).order_by(User.id)
>>> query.all()
[<User(name='ed', fullname='Ed Jones', nickname='eddie')>,
      <User(name='fred', fullname='Fred Flintstone', nickname='freddy')>]
```

- [`Query.first()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.first)以标量的形式返回第一个结果:

```python
>>> query.first()
<User(name='ed', fullname='Ed Jones', nickname='eddie')>
```

- [`Query.one()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.one)完全获取所有行，如果返回结果包含不止一个或者没有记录，则报错：

```python
>>> user = query.one()
Traceback (most recent call last):
...
MultipleResultsFound: Multiple rows were found for one()
```

```python
>>> user = query.filter(User.id == 99).one()
Traceback (most recent call last):
...
NoResultFound: No row was found for one()
```

- [`Query.one_or_none()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.one_or_none)和[`Query.one()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.one)类似，当没有结果时返回`None`.

- [`Query.scalar()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.scalar)调用[`Query.one()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.one)，成功后返回第一行

  ```python
  >>> query = session.query(User.id).filter(User.name == 'ed').order_by(User.id)
  >>> query.scalar()
  1
  ```

### 使用文本SQL

查询的多个方法都支持使用[`text()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.text) 构造文本SQL，比如[`Query.filter()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.filter) 和[`Query.order_by()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.order_by):

```python 
>>> from sqlalchemy import text
>>> for user in session.query(User).\
...             filter(text("id<224")).\
...             order_by(text("id")).all():
...     print(user.name)
ed
wendy
mary
fred
```

可以使用[`Query.params()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.params) 给文本SQL传递参数：

```python
>>> session.query(User).filter(text("id<:value and name=:name")).\
...     params(value=224, name='fred').order_by(User.id).one()
<User(name='fred', fullname='Fred Flintstone', nickname='freddy')>
```

还可以把文本SQL传给[`Query.from_statement()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.from_statement)方法：

```python
>>> session.query(User).from_statement(
...  text("SELECT * FROM users where name=:name")).params(name='ed').all()
[<User(name='ed', fullname='Ed Jones', nickname='eddie')>]
```

更灵活的可以使用[`TextClause.columns()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.TextClause.columns)给文本SQL映射字段的顺序：

```python
>>> stmt = text("SELECT name, id, fullname, nickname "
...             "FROM users where name=:name")
>>> stmt = stmt.columns(User.name, User.id, User.fullname, User.nickname)
>>> session.query(User).from_statement(stmt).params(name='ed').all()
[<User(name='ed', fullname='Ed Jones', nickname='eddie')>]
```

可以让结果返回单个列字段的组合，而不是行对象：

```python 
>>> stmt = text("SELECT name, id FROM users where name=:name")
>>> stmt = stmt.columns(User.name, User.id)
SQL>>> session.query(User.id, User.name).\
...          from_statement(stmt).params(name='ed').all()
[(1, u'ed')]
```

### 计数（Counting）

使用[`Query.count()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.count)方法返回计数结果：

```python
>>> session.query(User).filter(User.name.like('%ed')).count()
2
```

对于需要明确指出“要计数的东西”的情况，我们可以直接使用表达式[`expression.func`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.func) 

```python
>>> from sqlalchemy import func
>>> session.query(func.count(User.name), User.name).group_by(User.name).all()
[(1, u'ed'), (1, u'fred'), (1, u'mary'), (1, u'wendy')]
```

## 建立关系

现在假设有存储电子邮箱表和用户表关联，用户表到电子邮件表是一对多的关系， 下面建立`Address`类，并和`User`类关联起来:

```python
>>> from sqlalchemy import ForeignKey
>>> from sqlalchemy.orm import relationship

>>> class Address(Base):
...     __tablename__ = 'addresses'
...     id = Column(Integer, primary_key=True)
...     email_address = Column(String, nullable=False)
...     user_id = Column(Integer, ForeignKey('users.id'))
...
...     user = relationship("User", back_populates="addresses")
...
...     def __repr__(self):
...         return "<Address(email_address='%s')>" % self.email_address

>>> User.addresses = relationship(
...     "Address", order_by=Address.id, back_populates="user")
```

上面addresses表中定义了一个外键关联了users表， 使用[`relationship()`](https://docs.sqlalchemy.org/en/14/orm/relationship_api.html#sqlalchemy.orm.relationship)来维护两个类之间的关系映射，addresses表到users表就是多对一关系。

> 外键列大多数情况下只能关联到主键列或者唯一约束列，外键列本身可以有多个列，并关联多个主键列，这成为符合外键，当关联的列被修改后，外键列会自动更新自己，外键列也可以引用自己本身，这被称为自引用外键

现在可以通过元数据创建addresses表，它会跳过已经存在的表：

```python
>>> Base.metadata.create_all(engine)
```

## 处理关联对象

当实例化一个User时，一个空的addresses属性就会产生，它代表一个空的列表：

```python
>>> jack = User(name='jack', fullname='Jack Bean', nickname='gjffdd')
>>> jack.addresses
[]
```

当要添加Address对象给User对象时，只需要给列表赋值：

```python
>>> jack.addresses = [
...                 Address(email_address='jack@google.com'),
...                 Address(email_address='j25@yahoo.com')]
```

当使用双向关系时，在一个方向上添加的元素在另一个方向上自动可见。这种是通过Python中on-change事件计算得到的，并非使用SQL:

```python
>>> jack.addresses[1]
<Address(email_address='j25@yahoo.com')>

>>> jack.addresses[1].user
<User(name='jack', fullname='Jack Bean', nickname='gjffdd')>
```

通过被称为级联的处理，jack和两个地址被一起一次性的加入到session中：

```python
>>> session.add(jack)
>>> session.commit()
```

现在可以查询刚刚加入的Jack：

```python
>>> jack = session.query(User).\
... filter_by(name='jack').one()
>>> jack
<User(name='jack', fullname='Jack Bean', nickname='gjffdd')>

>>> jack.addresses
[<Address(email_address='jack@google.com')>, <Address(email_address='j25@yahoo.com')>]
```

## 连接查询

要在User` 和 `Address之间构造一个隐式的连接查询，我们可以使用[`Query.filter()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.filter)把它们关联的列等同起来，以达到一次查询多个表的目的；

```python
>>> for u, a in session.query(User, Address).\
...                     filter(User.id==Address.user_id).\
...                     filter(Address.email_address=='jack@google.com').\
...                     all():
...     print(u)
...     print(a)
<User(name='jack', fullname='Jack Bean', nickname='gjffdd')>
<Address(email_address='jack@google.com')>
```

连接查询的另一个便捷的方法是使用[`Query.join()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.join)，这个方法可以自动处理好有一个或多个外键的情况：

```python
>>> session.query(User).join(Address).\
...         filter(Address.email_address=='jack@google.com').\
...         all()
[<User(name='jack', fullname='Jack Bean', nickname='gjffdd')>]
```

```python
query.join(Address, User.id==Address.user_id)          # explicit condition
query.join(User.addresses)                             # specify relationship from left to right
query.join(Address, User.addresses)                    # same, with explicit target
query.join(User.addresses.and_(Address.name != 'foo')) # use relationship + additional ON criteria
```

外键连接使用[`Query.outerjoin()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.outerjoin) 

```python
query.outerjoin(User.addresses)   # LEFT OUTER JOIN
```

### 使用别名

在处理多表过程中，当一个表需要被引用多次时，需要为表取别名，通过函数[`aliased()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.aliased) 实现，还可以可以使用特殊的属性方法[`PropComparator.of_type()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.PropComparator.of_type)来定位取了别名的目标，

```python
>>> from sqlalchemy.orm import aliased
>>> adalias1 = aliased(Address)
>>> adalias2 = aliased(Address)
>>> for username, email1, email2 in \
...     session.query(User.name, adalias1.email_address, adalias2.email_address).\
...     join(User.addresses.of_type(adalias1)).\
...     join(User.addresses.of_type(adalias2)).\
...     filter(adalias1.email_address=='jack@google.com').\
...     filter(adalias2.email_address=='j25@yahoo.com'):
...     print(username, email1, email2)
jack jack@google.com j25@yahoo.com
```

### 使用子查询

想象一下我们要统计每个用户拥有的电子邮件的数量，可以使用类似下面的子查询SQL语句：

```sql
SELECT users.*, adr_count.address_count FROM users LEFT OUTER JOIN
    (SELECT user_id, count(*) AS address_count
        FROM addresses GROUP BY user_id) AS adr_count
    ON users.id=adr_count.user_id
```

下面实例演示在ORM中如何生成子查询语句：

```python
>>> from sqlalchemy.sql import func
>>> stmt = session.query(Address.user_id, func.count('*').\
...         label('address_count')).\
...         group_by(Address.user_id).subquery()
```

使用subquery()就构造出了一条子查询语句，类似[`Table`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Table)对象，可以通过属性c访问列字段：

```python
>>> for u, count in session.query(User, stmt.c.address_count).\
...     outerjoin(stmt, User.id==stmt.c.user_id).order_by(User.id):
...     print(u, count)
<User(name='ed', fullname='Ed Jones', nickname='eddie')> None
<User(name='wendy', fullname='Wendy Williams', nickname='windy')> None
<User(name='mary', fullname='Mary Contrary', nickname='mary')> None
<User(name='fred', fullname='Fred Flintstone', nickname='freddy')> None
<User(name='jack', fullname='Jack Bean', nickname='gjffdd')> 2
```

### 从子查询选择实体

我们使用aliased()来关联一个映射类的“别名”到子查询:

```python
>>> stmt = session.query(Address).\
...                 filter(Address.email_address != 'j25@yahoo.com').\
...                 subquery()
>>> adalias = aliased(Address, stmt)
>>> for user, address in session.query(User, adalias).\
...         join(adalias, User.addresses):
...     print(user)
...     print(address)
<User(name='jack', fullname='Jack Bean', nickname='gjffdd')>
<Address(email_address='jack@google.com')>
```

### 使用EXISTS关键字

显示的构造EXISTS，如下面所示：

```python
>>> from sqlalchemy.sql import exists
>>> stmt = exists().where(Address.user_id==User.id)
>>> for name, in session.query(User.name).filter(stmt):
...     print(name)
jack
```

`Query`有操作符 [`Comparator.any()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.RelationshipProperty.Comparator.any)和[`Comparator.has()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.RelationshipProperty.Comparator.has)会自动应用EXISTS关键字：

```python
>>> for name, in session.query(User.name).\
...         filter(User.addresses.any()):
...     print(name)
jack
```

```python
>>> session.query(Address).\
...         filter(~Address.user.has(User.name=='jack')).all()
[]
```

### 常见关系运算符

下面列出了所有的用于构建关系的运算符，所有列表项都链接到官方详细使用说明文档：

- [`Comparator.__eq__()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.RelationshipProperty.Comparator.__eq__) - 多对一相等比较:

```python
query.filter(Address.user == someuser)
```

- [`Comparator.__ne__()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.RelationshipProperty.Comparator.__ne__)- 多对一不相等比较:

```python
query.filter(Address.user != someuser)
```

- IS NULL - 多对一比较, 背后使用的[`Comparator.__eq__()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.RelationshipProperty.Comparator.__eq__)进行比较:

```python
query.filter(Address.user == None)
```

- [`Comparator.contains()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.RelationshipProperty.Comparator.contains) - 包含，用于一对多集合:

```python
query.filter(User.addresses.contains(someaddress))
```

- [`Comparator.any()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.RelationshipProperty.Comparator.any) - 用于一对多集合：

```python
query.filter(User.addresses.any(Address.email_address == 'bar'))

# also takes keyword arguments:
query.filter(User.addresses.any(email_address='bar'))
```

- [`Comparator.has()`](https://docs.sqlalchemy.org/en/14/orm/internals.html#sqlalchemy.orm.RelationshipProperty.Comparator.has) - 用于标量查询：

```python
query.filter(Address.user.has(name='ed'))
```

- [`Query.with_parent()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.with_parent) - 用于任何关系：

```python
session.query(Address).with_parent(someuser, 'addresses')
```

## 预加载

预加载就是在一次查询中，预先加载出相关联的表的数据， 预加载是通过调用[`Query.options()`](https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.options)并传入预加载的函数来实现的，sqlalchemy中有三种预加载的方法：

### Selectin Load

```python
>>> from sqlalchemy.orm import selectinload
>>> jack = session.query(User).\
...                 options(selectinload(User.addresses)).\
...                 filter_by(name='jack').one()
>>> jack
<User(name='jack', fullname='Jack Bean', nickname='gjffdd')>

>>> jack.addresses
[<Address(email_address='jack@google.com')>, <Address(email_address='j25@yahoo.com')>]
```

生成的sql语句：

```sql
SELECT users.id AS users_id,
        users.name AS users_name,
        users.fullname AS users_fullname,
        users.nickname AS users_nickname
FROM users
WHERE users.name = ?
[...] ('jack',)
SELECT addresses.user_id AS addresses_user_id,
        addresses.id AS addresses_id,
        addresses.email_address AS addresses_email_address
FROM addresses
WHERE addresses.user_id IN (?)
ORDER BY addresses.id
[...] (5,)
```

### Joined Load

```python
>>> from sqlalchemy.orm import joinedload

>>> jack = session.query(User).\
...                        options(joinedload(User.addresses)).\
...                        filter_by(name='jack').one()
>>> jack
<User(name='jack', fullname='Jack Bean', nickname='gjffdd')>

>>> jack.addresses
[<Address(email_address='jack@google.com')>, <Address(email_address='j25@yahoo.com')>]
```

生成的sql语句：

```python
SELECT users.id AS users_id,
        users.name AS users_name,
        users.fullname AS users_fullname,
        users.nickname AS users_nickname,
        addresses_1.id AS addresses_1_id,
        addresses_1.email_address AS addresses_1_email_address,
        addresses_1.user_id AS addresses_1_user_id
FROM users
    LEFT OUTER JOIN addresses AS addresses_1 ON users.id = addresses_1.user_id
WHERE users.name = ? ORDER BY addresses_1.id
[...] ('jack',)
```

### 显式join加上预加载

```python
>>> from sqlalchemy.orm import contains_eager
>>> jacks_addresses = session.query(Address).\
...                             join(Address.user).\
...                             filter(User.name=='jack').\
...                             options(contains_eager(Address.user)).\
...                             all()
>>> jacks_addresses
[<Address(email_address='jack@google.com')>, <Address(email_address='j25@yahoo.com')>]

>>> jacks_addresses[0].user
<User(name='jack', fullname='Jack Bean', nickname='gjffdd')>
```

生成的sql：

```sql
SELECT users.id AS users_id,
        users.name AS users_name,
        users.fullname AS users_fullname,
        users.nickname AS users_nickname,
        addresses.id AS addresses_id,
        addresses.email_address AS addresses_email_address,
        addresses.user_id AS addresses_user_id
FROM addresses JOIN users ON users.id = addresses.user_id
WHERE users.name = ?
[...] ('jack',)
```

## 删除

当删除一行数据时， 默认情况下不会删除关联的另一个表的行，要实现关联删除，可以在类的relationship定义配置**cascade**参数：

```python
...     __tablename__ = 'users'
...
...     id = Column(Integer, primary_key=True)
...     name = Column(String)
...     fullname = Column(String)
...     nickname = Column(String)
...
...     addresses = relationship("Address", back_populates='user',
...                     cascade="all, delete, delete-orphan")
...
...     def __repr__(self):
...        return "<User(name='%s', fullname='%s', nickname='%s')>" % (
...                                self.name, self.fullname, self.nickname)
```

```python
>>> class Address(Base):
...     __tablename__ = 'addresses'
...     id = Column(Integer, primary_key=True)
...     email_address = Column(String, nullable=False)
...     user_id = Column(Integer, ForeignKey('users.id'))
...     user = relationship("User", back_populates="addresses")
...
...     def __repr__(self):
...         return "<Address(email_address='%s')>" % self.email_address
```

上面两个表建立了级联删除关系，当删除一个用户时，这个用户关联的邮件地址记录也会删除：

```python
>>> session.delete(jack)

>>> session.query(User).filter_by(name='jack').count()
0

>>> session.query(Address).filter(
...    Address.email_address.in_(['jack@google.com', 'j25@yahoo.com'])
... ).count()
0
```

## 构建多对多关系

要构建多对多关系需要建立一个中间关联表，然后两个关联表的类通过relationship的secondary都指向这个关联表：

```python
>>> from sqlalchemy import Table, Text
>>> # association table
>>> post_keywords = Table('post_keywords', Base.metadata,
...     Column('post_id', ForeignKey('posts.id'), primary_key=True),
...     Column('keyword_id', ForeignKey('keywords.id'), primary_key=True)
... )

>>> class BlogPost(Base):
...     __tablename__ = 'posts'
...
...     id = Column(Integer, primary_key=True)
...     user_id = Column(Integer, ForeignKey('users.id'))
...     headline = Column(String(255), nullable=False)
...     body = Column(Text)
...
...     # many to many BlogPost<->Keyword
...     keywords = relationship('Keyword',
...                             secondary=post_keywords,
...                             back_populates='posts')
...
...     def __init__(self, headline, body, author):
...         self.author = author
...         self.headline = headline
...         self.body = body
...
...     def __repr__(self):
...         return "BlogPost(%r, %r, %r)" % (self.headline, self.body, self.author)


>>> class Keyword(Base):
...     __tablename__ = 'keywords'
...
...     id = Column(Integer, primary_key=True)
...     keyword = Column(String(50), nullable=False, unique=True)
...     posts = relationship('BlogPost',
...                          secondary=post_keywords,
...                          back_populates='keywords')
...
...     def __init__(self, keyword):
...         self.keyword = keyword
```

查询多对多关系的表和查询一般的表方法基本上都相同。