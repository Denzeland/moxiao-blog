---
title: SQLAlchemy基础教程
date: 2020-11-04
sidebar: 'auto'
categories:
 - python集录
tags:
 - python
 - SQLAlchemy
---

SQLAlchemy主要由两个不同的api构成，分别被称为**Core**和**ORM**。**Core**是SQLAlchemy作为“数据库工具包”的基础架构。这个库提供了一些工具，用于管理与数据库的连接、与数据库查询和结果进行交互以及编程地构造SQL语句。**ORM**构建在**Core**之上，提供可选的对象关系映射功能。ORM提供了一个额外的配置层，允许将用户定义的Python类映射到数据库表和其他构造，以及称为**Session**（会话）的对象持久性机制。然后，它扩展了核心级SQL表达式语言，允许根据用户定义的对象组合和调用SQL查询。对于SQLAlchemy的使用，将从下面6个方面进行介绍：

## 建立连接—Engine对象

任何SQLAlchemy应用都以`Engine`对象作为开始，这个对象提供数据库的连接池，本教程使用在内存使用的SQLite数据库，`Engine`对象通过`create_engine()`创建：

```python
>>> from sqlalchemy import create_engine
>>> engine = create_engine("sqlite+pysqlite:///:memory:", echo=True, future=True)
```

`create_engine`第一个参数是数据库连接字符串， 描述与什么数据库交互（这里是`sqlite`），使用的Python [DBAPI](https://docs.sqlalchemy.org/en/14/glossary.html#term-DBAPI)（这里是`pysqlite`）以及如何定位数据库（这里使用内存存储），第二个参数指定了引擎记录日志的形式（这里是输出到标准输出），这实际上是设[Python logging日志](https://docs.sqlalchemy.org/en/14/core/engines.html#dbengine-logging)的简便方法，最后一个参数表示API的形式是[2.0风格](https://docs.sqlalchemy.org/en/14/glossary.html#term-2.0-style)

## 处理事务和DBAPI

有了Engine对象，接下来就是连接数据库和处理操作的结果，在SQLAlchemy中分别称之为[`Connection`](https://docs.sqlalchemy.org/en/14/core/future.html#sqlalchemy.future.Connection) 和[`Result`](https://docs.sqlalchemy.org/en/14/core/connections.html#sqlalchemy.engine.Result)对象，在这里我们使用[`text()`](https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.expression.text)来构造文本型SQL语句。

### 获得数据库连接

当直接使用**Core** API时， [`Connection`](https://docs.sqlalchemy.org/en/14/core/future.html#sqlalchemy.future.Connection)对象代表了与数据库进行的所有交互，一般需要在Python上下文管理器中使用连接：

```python
>>> from sqlalchemy import text

>>> with engine.connect() as conn:
...     result = conn.execute(text("select 'hello world'"))
...     print(result.all())
```

在上面的示例中，上下文管理器提供了数据库连接，并将操作限制在事务内。Python DBAPI的默认行为包括事务总是在进行中;当释放连接时，将发出回滚以结束事务。事务不会主动提交，我们需要调用 [`Connection.commit()`](https://docs.sqlalchemy.org/en/14/core/future.html#sqlalchemy.future.Connection.commit)来手动提交。

### 提交更改

在连接上下文中使用[`Connection.commit()`](https://docs.sqlalchemy.org/en/14/core/future.html#sqlalchemy.future.Connection.commit) 来提交变更：

```python
>>> with engine.connect() as conn:
...     conn.execute(text("CREATE TABLE some_table (x int, y int)"))
...     conn.execute(
...         text("INSERT INTO some_table (x, y) VALUES (:x, :y)"),
...         [{"x": 1, "y": 1}, {"x": 2, "y": 4}]
...     )
...     conn.commit()
```

也有一种方式自动commit：

```python
# "begin once"
>>> with engine.begin() as conn:
...     conn.execute(
...         text("INSERT INTO some_table (x, y) VALUES (:x, :y)"),
...         [{"x": 6, "y": 8}, {"x": 9, "y": 10}]
...     )
```

### 语句执行的基础

1. **获取行**

 [`Connection.execute()`](https://docs.sqlalchemy.org/en/14/core/future.html#sqlalchemy.future.Connection.execute)（在ORM API中是[`Session.execute()`](https://docs.sqlalchemy.org/en/14/orm/session_api.html#sqlalchemy.orm.Session.execute)）返回[`Result`](https://docs.sqlalchemy.org/en/14/core/connections.html#sqlalchemy.engine.Result)对象，我们可以通过这个对象来获取数据：

```python
>>> with engine.connect() as conn:
...     result = conn.execute(text("SELECT x, y FROM some_table"))
...     for row in result:
...         print(f"x: {row.x}  y: {row.y}")
```

[`Result`](https://docs.sqlalchemy.org/en/14/core/connections.html#sqlalchemy.engine.Result) 对象有很多方法获取或转换行，比如 [`Result.all()`](https://docs.sqlalchemy.org/en/14/core/connections.html#sqlalchemy.engine.Result.all) 方法返回[`Row`](https://docs.sqlalchemy.org/en/14/core/connections.html#sqlalchemy.engine.Row)对象组成的列表， [`Row`](https://docs.sqlalchemy.org/en/14/core/connections.html#sqlalchemy.engine.Row)对象类似于Python命名的元组。下面我们将说明访问行的各种方法：

- 元组赋值

```python
result = conn.execute(text("select x, y from some_table"))

for x, y in result:
    # ...
```

- 通过索引取值

```python
result = conn.execute(text("select x, y from some_table"))

  for row in result:
      x = row[0]
```

- 属性名称取值

```python
result = conn.execute(text("select x, y from some_table"))

for row in result:
    y = row.y

    # illustrate use with Python f-strings
    print(f"Row: {row.x} {row.y}")
```

- 映射访问

```python
result = conn.execute(text("select x, y from some_table"))

for dict_row in result.mappings():
    x = dict_row['x']
    y = dict_row['y']
```

2. **传递参数**

可以传递单个参数，和多个参数， 看下面的代码就能明白：

```python
>>> with engine.connect() as conn:
...     result = conn.execute(
...         text("SELECT x, y FROM some_table WHERE y > :y"),
...         {"y": 2}
...     )
...     for row in result:
...        print(f"x: {row.x}  y: {row.y}")
```

```python
>>> with engine.connect() as conn:
...     conn.execute(
...         text("INSERT INTO some_table (x, y) VALUES (:x, :y)"),
...         [{"x": 11, "y": 12}, {"x": 13, "y": 14}]
...     )
...     conn.commit()
```

3. **通过ORM Session来执行**

当 [`Session`](https://docs.sqlalchemy.org/en/14/orm/session_api.html#sqlalchemy.orm.Session) 对象用于非ORM场景， 它和`engine.connect()`没有什么区别， 看下面的代码：

```python
>>> from sqlalchemy.orm import Session

>>> stmt = text("SELECT x, y FROM some_table WHERE y > :y ORDER BY x, y").bindparams(y=6)
>>> with Session(engine) as session:
...     result = session.execute(stmt)
...     for row in result:
...        print(f"x: {row.x}  y: {row.y}")
```

## 处理数据库元数据（Metadata）

上面都是通过构造文本sql语句来执行数据库的操作，SQLAlchemy的Core和ORM的核心元素都是SQL表达式语言，它允许流畅、可组合地构造SQL查询。这些查询的基础是表示表和列等数据库概念的Python对象。这些对象统称为[数据库元数据](https://docs.sqlalchemy.org/en/14/glossary.html#term-database-metadata)，包括[`MetaData`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.MetaData), [`Table`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Table), 和[`Column`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Column)等

### 使用Table对象初始化MetaData 

基本的使用看下面的例子：

```python
>>> from sqlalchemy import MetaData
>>> metadata = MetaData()
>>> from sqlalchemy import Table, Column, Integer, String
>>> user_table = Table(
...     "user_account",
...     metadata,
...     Column('id', Integer, primary_key=True),
...     Column('name', String(30)),
...     Column('fullname', String)
... )
```

在这个定义中，[`Table`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Table)表示数据库表，并将其本身分配给 [`MetaData`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.MetaData)集合，[`Column`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Column)数据库表中的一列， 并将其本身分配给[`Table`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Table)对象，[`Table.c`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Table.c)可以访问到列的集合：

```python
>>> user_table.c.name
Column('name', String(length=30), table=<user_account>)

>>> user_table.c.keys()
['id', 'name', 'fullname']
```

[`Integer`](https://docs.sqlalchemy.org/en/14/core/type_basics.html#sqlalchemy.types.Integer), [`String`](https://docs.sqlalchemy.org/en/14/core/type_basics.html#sqlalchemy.types.String) 表示列的数据类型

### 定义数据库约束

[`Column.primary_key`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Column.params.primary_key)参数定义了主键约束，外键约束可以在列的定义中调用`ForeignKey`，非空约束可以用参数`nullable`定义：

```python
>>> from sqlalchemy import ForeignKey
>>> address_table = Table(
...     "address",
...     metadata,
...     Column('id', Integer, primary_key=True),
...     Column('user_id', ForeignKey('user_account.id'), nullable=False),
...     Column('email_address', String, nullable=False)
... )
```

### 触发数据库定义语言

数据库定义好了以后，可以使用`metadata.create_all(engine)`在目标数据库产生变更：

```python
>>> metadata.create_all(engine)
```

产生的sql语句:

```python
BEGIN (implicit)
PRAGMA main.table_...info("user_account")
...
PRAGMA main.table_...info("address")
...
CREATE TABLE user_account (
    id INTEGER NOT NULL,
    name VARCHAR(30),
    fullname VARCHAR,
    PRIMARY KEY (id)
)
...
CREATE TABLE address (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    email_address VARCHAR NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES user_account (id)
)
...
COMMIT
```

### 使用ORM来定义表的元数据

在使用ORM时，元数据集合仍然存在，但是它本身包含在一个称为注册表[`registry`](https://docs.sqlalchemy.org/en/14/orm/mapping_api.html#sqlalchemy.orm.registry)的仅使用ORM的对象中，ORM定义的表映射类都是继承自注册表产生的`Base`类， `Base`类有两种方式产生：

```python
>>> from sqlalchemy.orm import registry
>>> mapper_registry = registry()
>>> Base = mapper_registry.generate_base()

>>> mapper_registry.metadata
MetaData()
```

```python
from sqlalchemy.orm import declarative_base
Base = declarative_base()
```

- 定义映射类：

```python
>>> from sqlalchemy.orm import relationship
>>> class User(Base):
...     __tablename__ = 'user_account'
...
...     id = Column(Integer, primary_key=True)
...     name = Column(String(30))
...     fullname = Column(String)
...
...     addresses = relationship("Address", back_populates="user")
...
...     def __repr__(self):
...        return f"User(id={self.id!r}, name={self.name!r}, fullname={self.fullname!r})"

>>> class Address(Base):
...     __tablename__ = 'address'
...
...     id = Column(Integer, primary_key=True)
...     email_address = Column(String, nullable=False)
...     user_id = Column(Integer, ForeignKey('user_account.id'))
...
...     user = relationship("User", back_populates="addresses")
...
...     def __repr__(self):
...         return f"Address(id={self.id!r}, email_address={self.email_address!r})"
```

查看[`Table`](https://docs.sqlalchemy.org/en/14/core/metadata.html#sqlalchemy.schema.Table) 对象可以使用__table__属性：

```python
>>> User.__table__
Table('user_account', MetaData(),
    Column('id', Integer(), table=<user_account>, primary_key=True, nullable=False),
    Column('name', String(length=30), table=<user_account>),
    Column('fullname', String(), table=<user_account>), schema=None)
```

