---
title: Flask-RESTful中文文档
description: 本文是Flask-RESTful中文文档，没有详尽翻译源文档，但基本保持原文档的主要内容
date: 2020-11-12
sidebar: 'auto'
categories:
 - python集录
tags:
 - python
 - flask
---

Flask-RESTful是Flask的一个扩展，它增加了对快速构建REST api的支持。它是与现有ORM/库一起工作的轻量级抽象。Flask-RESTful鼓励使用最小设置的最佳实践。如果你熟悉Flask, Flask- restful应该很容易上手

## 安装

```shell
pip install flask-restful
```

## 快速开始

### 一个最小化的API

一个最小化的Flask-RESTful API就像下面的代码：

```python
from flask import Flask
from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)

class HelloWorld(Resource):
    def get(self):
        return {'hello': 'world'}

api.add_resource(HelloWorld, '/')

if __name__ == '__main__':
    app.run(debug=True)
```

将这个文件保存并运行，就得到了一个启用了[Flask debugging](http://flask.pocoo.org/docs/quickstart/#debug-mode)模式的web服务，可以通过curl来测试API：

```python
$ curl http://127.0.0.1:5000/
{"hello": "world"}
```

### 资源路由

Flask-RESTful的主要构建块就是资源（resources），构建在[Flask可插拔视图](http://flask.pocoo.org/docs/views/)之上，只需要在resource上定义各种HTTP方法，就能得到满足各种HTTP方法访问的API，下面是一个基础的CRUD todo应用：

```python
from flask import Flask, request
from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)

todos = {}

class TodoSimple(Resource):
    def get(self, todo_id):
        return {todo_id: todos[todo_id]}

    def put(self, todo_id):
        todos[todo_id] = request.form['data']
        return {todo_id: todos[todo_id]}

api.add_resource(TodoSimple, '/<string:todo_id>')

if __name__ == '__main__':
    app.run(debug=True)
```

可以像下面这样测试API：

```python
$ curl http://localhost:5000/todo1 -d "data=Remember the milk" -X PUT
{"todo1": "Remember the milk"}
$ curl http://localhost:5000/todo1
{"todo1": "Remember the milk"}
$ curl http://localhost:5000/todo2 -d "data=Change my brakepads" -X PUT
{"todo2": "Change my brakepads"}
$ curl http://localhost:5000/todo2
{"todo2": "Change my brakepads"}
```

或者使用requests库来测试：

```python
>>> from requests import put, get
>>> put('http://localhost:5000/todo1', data={'data': 'Remember the milk'}).json()
{u'todo1': u'Remember the milk'}
>>> get('http://localhost:5000/todo1').json()
{u'todo1': u'Remember the milk'}
>>> put('http://localhost:5000/todo2', data={'data': 'Change my brakepads'}).json()
{u'todo2': u'Change my brakepads'}
>>> get('http://localhost:5000/todo2').json()
{u'todo2': u'Change my brakepads'}
```

Flask-RESTful理解从视图方法返回的不同类型的值，类似Flask，可以返回任何可迭代对象，它会被转化为包含Flask原始响应对象的响应对象， 并且Flask-RESTful还支持使用多个返回值来设置响应代码和响应头，就像下面的例子：

```python
class Todo1(Resource):
    def get(self):
        # Default to 200 OK
        return {'task': 'Hello world'}

class Todo2(Resource):
    def get(self):
        # Set the response code to 201
        return {'task': 'Hello world'}, 201

class Todo3(Resource):
    def get(self):
        # Set the response code to 201 and return custom headers
        return {'task': 'Hello world'}, 201, {'Etag': 'some-opaque-string'}
```

### 端点

大多数情况下，你的资源会有不止一个URL，你可以给Api对象的[`add_resource()`](https://flask-restful.readthedocs.io/en/latest/api.html#flask_restful.Api.add_resource)传递多个URL，每个URL都会路由到你的资源：

```python
api.add_resource(HelloWorld,
    '/',
    '/hello')
```

还可以将路径的一部分作为变量匹配到资源方法：

```python
api.add_resource(Todo,
    '/todo/<int:todo_id>', endpoint='todo_ep')
```

### 参数解析

虽然Flask提供了对请求数据的简单访问(例如querystring或者POST表单编码数据)，但是验证表单数据仍需要手动去验证，Flask-RESTful对于请求数据的验证有内置的支持，使用类似[argparse](http://docs.python.org/dev/library/argparse.html).的模块：

```python
from flask_restful import reqparse

parser = reqparse.RequestParser()
parser.add_argument('rate', type=int, help='Rate to charge for this resource')
args = parser.parse_args()
```

如果参数未能通过验证，Flask-RESTful将响应一个400个错误请求和一个突出显示错误的响应:

```python
$ curl -d 'rate=foo' http://127.0.0.1:5000/todos
{'status': 400, 'message': 'foo cannot be converted to int'}
```

模块也提供了许多包含的通用转换函数，如[`inputs.date()`](https://flask-restful.readthedocs.io/en/latest/api.html#inputs.date)和 [`inputs.url()`](https://flask-restful.readthedocs.io/en/latest/api.html#inputs.url)。

使用参数strict=True来调用parse_args可以确保在请求包含解析器没有定义的参数时抛出错误：

```python
args = parser.parse_args(strict=True)
```

### 数据格式化

默认情况下，返回的iterable中的所有字段都将按原样呈现。虽然这在处理Python数据结构时非常有效，但在处理对象（object）时可能就比较费劲， 为解决这个问题，Flask-RESTful提供[`fields`](https://flask-restful.readthedocs.io/en/latest/api.html#module-fields)模块和[`marshal_with()`](https://flask-restful.readthedocs.io/en/latest/api.html#flask_restful.marshal_with)装饰器。与Django的ORM和WTForm类似，你使用fields模块来描述你的响应结构：

```python
from flask_restful import fields, marshal_with

resource_fields = {
    'task':   fields.String,
    'uri':    fields.Url('todo_ep')
}

class TodoDao(object):
    def __init__(self, todo_id, task):
        self.todo_id = todo_id
        self.task = task

        # This field will not be sent in the response
        self.status = 'active'

class Todo(Resource):
    @marshal_with(resource_fields)
    def get(self, **kwargs):
        return TodoDao(todo_id='my_todo', task='Remember the milk')
```

上面的示例接受一个python对象并将其序列化，[`marshal_with()`](https://flask-restful.readthedocs.io/en/latest/api.html#flask_restful.marshal_with)装饰器将应用resource_fields描述的转换，从对象中提取的唯一字段是`task`。[`fields.Url`](https://flask-restful.readthedocs.io/en/latest/api.html#fields.Url)字段是一个特殊字段，它接受端点名，并在响应中为该端点生成Url。您需要的许多字段类型已经包含在内。查看[`fields`](https://flask-restful.readthedocs.io/en/latest/api.html#module-fields) 指南以获得完整的列表。

完整的例子：

```python
from flask import Flask
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)

TODOS = {
    'todo1': {'task': 'build an API'},
    'todo2': {'task': '?????'},
    'todo3': {'task': 'profit!'},
}


def abort_if_todo_doesnt_exist(todo_id):
    if todo_id not in TODOS:
        abort(404, message="Todo {} doesn't exist".format(todo_id))

parser = reqparse.RequestParser()
parser.add_argument('task')


# Todo
# shows a single todo item and lets you delete a todo item
class Todo(Resource):
    def get(self, todo_id):
        abort_if_todo_doesnt_exist(todo_id)
        return TODOS[todo_id]

    def delete(self, todo_id):
        abort_if_todo_doesnt_exist(todo_id)
        del TODOS[todo_id]
        return '', 204

    def put(self, todo_id):
        args = parser.parse_args()
        task = {'task': args['task']}
        TODOS[todo_id] = task
        return task, 201


# TodoList
# shows a list of all todos, and lets you POST to add new tasks
class TodoList(Resource):
    def get(self):
        return TODOS

    def post(self):
        args = parser.parse_args()
        todo_id = int(max(TODOS.keys()).lstrip('todo')) + 1
        todo_id = 'todo%i' % todo_id
        TODOS[todo_id] = {'task': args['task']}
        return TODOS[todo_id], 201

##
## Actually setup the Api resource routing here
##
api.add_resource(TodoList, '/todos')
api.add_resource(Todo, '/todos/<todo_id>')


if __name__ == '__main__':
    app.run(debug=True)
```

将文件保存并运行，可以测试下获得TODO列表：

```shell
$ curl http://localhost:5000/todos
{"todo1": {"task": "build an API"}, "todo3": {"task": "profit!"}, "todo2": {"task": "?????"}}
```

获取单个列表:

```shell
$ curl http://localhost:5000/todos/todo3
{"task": "profit!"}
```

删除一条任务：

```shell
$ curl http://localhost:5000/todos/todo2 -X DELETE -v

> DELETE /todos/todo2 HTTP/1.1
> User-Agent: curl/7.19.7 (universal-apple-darwin10.0) libcurl/7.19.7 OpenSSL/0.9.8l zlib/1.2.3
> Host: localhost:5000
> Accept: */*
>
* HTTP 1.0, assume close after body
< HTTP/1.0 204 NO CONTENT
< Content-Type: application/json
< Content-Length: 0
< Server: Werkzeug/0.8.3 Python/2.7.2
< Date: Mon, 01 Oct 2012 22:10:32 GMT
```

添加一条新任务：

```shell
$ curl http://localhost:5000/todos -d "task=something new" -X POST -v

> POST /todos HTTP/1.1
> User-Agent: curl/7.19.7 (universal-apple-darwin10.0) libcurl/7.19.7 OpenSSL/0.9.8l zlib/1.2.3
> Host: localhost:5000
> Accept: */*
> Content-Length: 18
> Content-Type: application/x-www-form-urlencoded
>
* HTTP 1.0, assume close after body
< HTTP/1.0 201 CREATED
< Content-Type: application/json
< Content-Length: 25
< Server: Werkzeug/0.8.3 Python/2.7.2
< Date: Mon, 01 Oct 2012 22:12:58 GMT
<
* Closing connection #0
{"task": "something new"}
```

更新一条任务：

```shell
$ curl http://localhost:5000/todos/todo3 -d "task=something different" -X PUT -v

> PUT /todos/todo3 HTTP/1.1
> Host: localhost:5000
> Accept: */*
> Content-Length: 20
> Content-Type: application/x-www-form-urlencoded
>
* HTTP 1.0, assume close after body
< HTTP/1.0 201 CREATED
< Content-Type: application/json
< Content-Length: 27
< Server: Werkzeug/0.8.3 Python/2.7.3
< Date: Mon, 01 Oct 2012 22:13:00 GMT
<
* Closing connection #0
{"task": "something different"}
```

下面的内容是对上面讲到的用法的详细说明：

## 解析请求

Flask-RESTful的请求解析接口[`reqparse`](https://flask-restful.readthedocs.io/en/latest/api.html#module-reqparse)是仿照[argparse](http://docs.python.org/dev/library/argparse.html)构建的，它被设计为提供简单和统一的访问Flask中的flask.request对象中变量的方法。

### 基本参数

这里有一个请求解析的例子，在**flask.Request.values**中寻找两个参数：一个整数一个字符串：

```python
from flask_restful import reqparse

parser = reqparse.RequestParser()
parser.add_argument('rate', type=int, help='Rate cannot be converted')
parser.add_argument('name')
args = parser.parse_args()
```

如果提供了help值，当解析参数出现类型错误时会把这个值当做错误消息。默认情况下，参数是**非必须**的。也就是说request 中提供的参数没有在RequestParser 定义，将会被忽略。如果在request parser中定义的参数没有出现在request 中，参数默认值将为None.

### 必须参数

如果要求一个参数必须要出现且必须有值，只需使用required=True调用函数：

```python
parser.add_argument('name', required=True,
help="Name cannot be blank!")
```

### 多个值 & 列表

如果想要参数作为列表接受多个值，只需传递action='append'：

```python
parser.add_argument('name', action='append')
```

请求接口时需要这样：

```shell
curl http://api.example.com -d "name=bob" -d "name=sue" -d "name=joe"
```

相应的解析参数得到的是列表：

```python
args = parser.parse_args()
args['name']    # ['bob', 'sue', 'joe']
```

### 参数别名

如果由于某种原因，您希望在解析后将参数存储在不同的名称下，那么可以使用dest关键字参数：

```python
parser.add_argument('name', dest='public_name')

args = parser.parse_args()
args['public_name']
```

### 参数位置

默认情况下，[`RequestParser`](https://flask-restful.readthedocs.io/en/latest/api.html#reqparse.RequestParser) 从`flask.Request.values`和 `flask.Request.json`解析参数，可以使用location参数来指定从哪里解析参数：

```python
# Look only in the POST body
parser.add_argument('name', type=int, location='form')

# Look only in the querystring
parser.add_argument('PageSize', type=int, location='args')

# From the request headers
parser.add_argument('User-Agent', location='headers')

# From http cookies
parser.add_argument('session_id', location='cookies')

# From file uploads
parser.add_argument('picture', type=werkzeug.datastructures.FileStorage, location='files')
```

还可以传递一个列表给location来指定多个位置：

```python
parser.add_argument('text', location=['headers', 'values'])
```

### 解析继承

通常，我们会为编写的每个资源创建一个不同的解析器，常见的问题是有共同的参数，为了不重写而复用共同的参数，可以使用解析继承。把共同的参数提取成父解析器，使用[`copy()`](https://flask-restful.readthedocs.io/en/latest/api.html#reqparse.RequestParser.copy)来继承，并使用[`replace_argument()`](https://flask-restful.readthedocs.io/en/latest/api.html#reqparse.RequestParser.replace_argument)和[`remove_argument()`](https://flask-restful.readthedocs.io/en/latest/api.html#reqparse.RequestParser.remove_argument)来修改和删除：

```python
from flask_restful import reqparse

parser = reqparse.RequestParser()
parser.add_argument('foo', type=int)

parser_copy = parser.copy()
parser_copy.add_argument('bar', type=int)

# parser_copy has both 'foo' and 'bar'

parser_copy.replace_argument('foo', required=True, location='json')
# 'foo' is now a required str located in json, not an int as defined
#  by original parser

parser_copy.remove_argument('foo')
# parser_copy no longer has 'foo' argument
```

## 输出字段

Flask-RESTful提供了一种简单的方法来控制在响应中实际呈现的数据，使用 [`fields`](https://flask-restful.readthedocs.io/en/latest/api.html#module-fields) 模块，你可以在你的资源中使用任何对象(ORM模型/自定义类/等等)。[`fields`](https://flask-restful.readthedocs.io/en/latest/api.html#module-fields) 还可以格式化并过滤你的响应，所以不必担心暴露内部的数据结构。

### 基本用法

可以传递定义要输出字段的字典或有序字典，key是对象的key或属性名，value是格式化或者返回字段值的class，下面的例子定义了三个字段，两个[`String`](https://flask-restful.readthedocs.io/en/latest/api.html#fields.String)和一个[`DateTime`](https://flask-restful.readthedocs.io/en/latest/api.html#fields.DateTime)：

```python
from flask_restful import Resource, fields, marshal_with

resource_fields = {
    'name': fields.String,
    'address': fields.String,
    'date_updated': fields.DateTime(dt_format='rfc822'),
}

class Todo(Resource):
    @marshal_with(resource_fields, envelope='resource')
    def get(self, **kwargs):
        return db_get_todo()  # Some function that queries the db
```

上面例子假设有个数据库对象odoo有属性name`, `address`, 和 `date_updated，对象的其他属性被认为是内部私有属性，不会输出。指定一个可选的envelope关键字参数来封装结果输出。这和下面这个例子是等同的：

```python
class Todo(Resource):
    def get(self, **kwargs):
        return marshal(db_get_todo(), resource_fields), 200
```

### 重命名属性和默认值

定义字段值时使用attribute参数，定义默认值使用default参数：

```python
fields = {
    'name': fields.String(attribute='private_name'),
    'address': fields.String,
}

fields = {
    'name': fields.String(attribute=lambda x: x._private_name),
    'address': fields.String,
}

fields = {
    'name': fields.String(attribute='people_list.0.person_dictionary.name'),
    'address': fields.String,
}

fields = {
    'name': fields.String(default='Anonymous User'),
    'address': fields.String,
}
```

### 自定义字段或字段有多个值

通过继承[`fields.Raw`](https://flask-restful.readthedocs.io/en/latest/api.html#fields.Raw)类并重写format函数自定义输出的字段：

```python
class UrgentItem(fields.Raw):
    def format(self, value):
        return "Urgent" if value & 0x01 else "Normal"

class UnreadItem(fields.Raw):
    def format(self, value):
        return "Unread" if value & 0x02 else "Read"

fields = {
    'name': fields.String,
    'priority': UrgentItem(attribute='flags'),
    'status': UnreadItem(attribute='flags'),
}
```

### Url字段或添加其他字段

Flask-RESTful包含一个特殊字段[`fields.Url`](https://flask-restful.readthedocs.io/en/latest/api.html#fields.Url)，它为被请求的资源合成一个uri，默认是相对uri，可以改变uri的格式：

```python
class RandomNumber(fields.Raw):
    def output(self, key, obj):
        return random.random()

fields = {
    'name': fields.String,
    # todo_resource is the endpoint name when you called api.add_resource()
    'uri': fields.Url('todo_resource'),
    'random': RandomNumber,
}

fields = {
    'uri': fields.Url('todo_resource', absolute=True),
    'https_uri': fields.Url('todo_resource', absolute=True, scheme='https')
}
```