---
title: Flask-Limiter中文文档
description: 本文是Flask-Limiter中文文档，没有详尽翻译源文档，是一个精炼化的学习总结
date: 2020-11-12
sidebar: 'auto'
categories:
 - python集录
tags:
 - python
 - flask
---

## 基本使用

### 安装：

```shell
pip install Flask-Limiter
```

### 快速开始：

```python
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
@app.route("/slow")
@limiter.limit("1 per day")
def slow():
    return ":("

@app.route("/medium")
@limiter.limit("1/second", override_defaults=False)
def medium():
    return ":|"

@app.route("/fast")
def fast():
    return ":)"

@app.route("/ping")
@limiter.exempt
def ping():
    return "PONG"
```

上面的代码让Flask app有了下面的路由访问频率限制特性：

- 针对请求的*remote_address*进行限制
- 默认所有的路由频率限制是每天200次，每小时50次
- `slow`路由有显式的频率限制装饰器，将绕过默认频率限制，值允许每天请求一次
- `medium`继承了默认的限制并且有装饰器限制每秒请求一次
- `ping`路由没有任何频率限制

::: tip 注意

flask内置的静态文件路由不受频率的限制

:::

每当请求超过频率限制时，视图函数将不会被调用，而会引发一个429 http错误。

### Flask-Limiter 扩展

有两种方式来初始化扩展：

- 使用构造函数：

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
....

limiter = Limiter(app, key_func=get_remote_address)
```

- 使用init_app延迟初始化：

```python
limiter = Limiter(key_func=get_remote_address)
limiter.init_app(app)
```

**频率限制域**

通过初始化的*key_func*参数函数返回在计算请求是否在速率限制内时放入的ip地址集合，扩展提供了两个工具函数：

- [`flask_limiter.util.get_ipaddr()`](https://flask-limiter.readthedocs.io/en/stable/#flask_limiter.util.get_ipaddr): 使用请求头X-Forwarded-For header中的最后一个ip,如果没有就返回到请求的remote_address
- [`flask_limiter.util.get_remote_address()`](https://flask-limiter.readthedocs.io/en/stable/#flask_limiter.util.get_remote_address): 使用请求的remote_address

**装饰器**

装饰器是 [`Limiter`](https://flask-limiter.readthedocs.io/en/stable/#flask_limiter.Limiter) 实例的方法，有下面4个装饰器：

1. [`Limiter.limit()`](https://flask-limiter.readthedocs.io/en/stable/#flask_limiter.Limiter.limit)

取决于你的喜好，有多种方法使用这个装饰器：

- 单个装饰器：限制字符串可以是单个限制或分隔符分隔的字符串

```python
@app.route("....")
@limiter.limit("100/day;10/hour;1/minute")
def my_route()
  ...
```

- 多个装饰器：限制字符串可以是单个限制或分隔符分隔的字符串，也可以是两者的组合。

```python
@app.route("....")
@limiter.limit("100/day")
@limiter.limit("10/hour")
@limiter.limit("1/minute")
def my_route():
  ...
```

- 自定义*key_func*

```python
def my_key_func():
  ...

@app.route("...")
@limiter.limit("100/day", my_key_func)
def my_route():
  ...
```

- 动态加载限制字符串：在某些情况下，可能需要从代码外部的源(数据库、远程api等)检索频率限制。这可以通过向decorator提供callable来实现。

  ```python
  def rate_limit_from_config():
      return current_app.config.get("CUSTOM_LIMIT", "10/s")
  
  @app.route("...")
  @limiter.limit(rate_limit_from_config)
  def my_route():
      ...
  ```

- 豁免条件: 在满足特定条件的情况下，每一限额均可豁免。这些条件可以通过在定义限制时提供一个callable作为一个' exemption t_when '参数来指定。

  ```python
  @app.route("/expensive")
  @limiter.limit("100/day", exempt_when=lambda: current_user.is_admin)
  def expensive_route():
    ...
  ```

2. [`Limiter.shared_limit()`](https://flask-limiter.readthedocs.io/en/stable/#flask_limiter.Limiter.shared_limit)

用于对于多个路由应该共享频率限制的场景，看下面的例子：

命名共享限制：

```python
mysql_limit = limiter.shared_limit("100/hour", scope="mysql")

@app.route("..")
@mysql_limit
def r1():
   ...

@app.route("..")
@mysql_limit
def r2():
   ...
```

共享限制还可以是动态的：scope参数接受一个函数，这个函数接受一个代表请求端点的字符串：

```python
def host_scope(endpoint_name):
    return request.host
host_limit = limiter.shared_limit("100/hour", scope=host_scope)

@app.route("..")
@host_limit
def r1():
   ...

@app.route("..")
@host_limit
def r2():
   ...
```

::: tip 注意

共享频率限制其他的用法和上面的一般频率限制的用法是一样的

:::

3. [`Limiter.exempt()`](https://flask-limiter.readthedocs.io/en/stable/#flask_limiter.Limiter.exempt)：这个装饰器只是将路由标记为不受任何频率限制的路由

4. [`Limiter.request_filter()`](https://flask-limiter.readthedocs.io/en/stable/#flask_limiter.Limiter.request_filter)：这个装饰器将函数标记为要执行的筛选器，以检查请求是否不受频率限制，被装饰的函数将会在执行频率检查时执行，可以设置白名单：

```python
@limiter.request_filter
def header_whitelist():
    return request.headers.get("X-Internal", "") == "true"

@limiter.request_filter
def ip_whitelist():
    return request.remote_addr == "127.0.0.1"
```

## 应用的配置

扩展为flask应用增加了下面的配置，如果相应的配置值是通过构造函数传入的，那么这些值将优先。

| `RATELIMIT_GLOBAL`                     | 自从 0.9.4版本删除了 使用 RATELIMIT_DEFAULT 代替.            |
| -------------------------------------- | ------------------------------------------------------------ |
| `RATELIMIT_DEFAULT`                    | A comma (or some other delimiter) separated string that will be used to apply a default limit on all routes. If not provided, the default limits can be passed to the [`Limiter`](https://flask-limiter.readthedocs.io/en/stable/#flask_limiter.Limiter) constructor as well (the values passed to the constructor take precedence over those in the config). [Rate limit string notation](https://flask-limiter.readthedocs.io/en/stable/#ratelimit-string) for details. |
| `RATELIMIT_DEFAULTS_PER_METHOD`        | Whether default limits are applied per method, per route or as a combination of all method per route. |
| `RATELIMIT_DEFAULTS_EXEMPT_WHEN`       | A function that should return a truthy value if the default rate limit(s) should be skipped for the current request. This callback is called in the [flask request context](https://flask.palletsprojects.com/en/1.1.x/reqcontext/#request-context) before_request phase. |
| `RATELIMIT_DEFAULTS_DEDUCT_WHEN`       | A function that should return a truthy value if a deduction should be made from the default rate limit(s) for the current request. This callback is called in the [flask request context](https://flask.palletsprojects.com/en/1.1.x/reqcontext/#request-context) after_request phase. |
| `RATELIMIT_APPLICATION`                | A comma (or some other delimiter) separated string that will be used to apply limits to the application as a whole (i.e. shared by all routes). |
| `RATELIMIT_STORAGE_URL`                | A storage location conforming to the scheme in [Storage scheme](https://limits.readthedocs.io/en/latest/storage.html#storage-scheme). A basic in-memory storage can be used by specifying `memory://` though this should probably never be used in production. Some supported backends include:Memcached: `memcached://host:port`Redis: `redis://host:port`GAE Memcached: `gaememcached://host:port`For specific examples and requirements of supported backends please refer to [Storage scheme](https://limits.readthedocs.io/en/latest/storage.html#storage-scheme). |
| `RATELIMIT_STORAGE_OPTIONS`            | A dictionary to set extra options to be passed to the storage implementation upon initialization. (Useful if you’re subclassing [`limits.storage.Storage`](https://limits.readthedocs.io/en/latest/api.html#limits.storage.Storage) to create a custom Storage backend.) |
| `RATELIMIT_STRATEGY`                   | The rate limiting strategy to use. [Rate limiting strategies](https://flask-limiter.readthedocs.io/en/stable/#ratelimit-strategy) for details. |
| `RATELIMIT_HEADERS_ENABLED`            | Enables returning [Rate-limiting Headers](https://flask-limiter.readthedocs.io/en/stable/#ratelimit-headers). Defaults to `False` |
| `RATELIMIT_ENABLED`                    | Overall kill switch for rate limits. Defaults to `True`      |
| `RATELIMIT_HEADER_LIMIT`               | Header for the current rate limit. Defaults to `X-RateLimit-Limit` |
| `RATELIMIT_HEADER_RESET`               | Header for the reset time of the current rate limit. Defaults to `X-RateLimit-Reset` |
| `RATELIMIT_HEADER_REMAINING`           | Header for the number of requests remaining in the current rate limit. Defaults to `X-RateLimit-Remaining` |
| `RATELIMIT_HEADER_RETRY_AFTER`         | Header for when the client should retry the request. Defaults to `Retry-After` |
| `RATELIMIT_HEADER_RETRY_AFTER_VALUE`   | Allows configuration of how the value of the Retry-After header is rendered. One of http-date or delta-seconds. ([RFC2616](https://tools.ietf.org/html/rfc2616#section-14.37)). |
| `RATELIMIT_SWALLOW_ERRORS`             | Whether to allow failures while attempting to perform a rate limit such as errors with downstream storage. Setting this value to `True` will effectively disable rate limiting for requests where an error has occurred. |
| `RATELIMIT_IN_MEMORY_FALLBACK_ENABLED` | `True`/`False`. If enabled an in memory rate limiter will be used as a fallback when the configured storage is down. Note that, when used in combination with `RATELIMIT_IN_MEMORY_FALLBACK` the original rate limits will not be inherited and the values provided in |
| `RATELIMIT_IN_MEMORY_FALLBACK`         | A comma (or some other delimiter) separated string that will be used when the configured storage is down. |
| `RATELIMIT_KEY_PREFIX`                 | Prefix that is prepended to each stored rate limit key. This can be useful when using a shared storage for multiple applications or rate limit domains. |

## 频率限制字符串表示法

频率限制被指定为以下格式的字符串:

[count] [per|/] [n (optional)] [second|minute|hour|day|month|year]

可以使用自己选择的分隔符将多个频率限制组合起来，默认是分号分隔符：

- 10 per hour
- 10/hour
- 10/hour;100/day;2000 per year
- 100/day, 500/7days