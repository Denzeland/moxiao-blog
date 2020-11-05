---
title: 在Keystone 5完成用户认证
date: 2020-10-27
sidebar: 'auto'
categories:
 - web前端
tags:
 - 前端
 - Keystone.js
showSponsor: true
featured: true
---

按官方的说法，Keystone 5是面向未来的一次重构， 自带GraphQL支持的高度可扩展的体系结构和一个漂亮的管理界面。使用Keystone 5只需关注数据模型层可以自动生成相应的GraphQL服务，对于前端发开服务端应用非常方便。最近几天我试用了一下，感觉确实很强大，下面记录一下我在Keystone 5集成用户认证的过程。
使用passoort中间件完成用户认证，因为完成的是用户名密码认证，所以使用passport-local这个包，会话存储在服务端（我实现的是存储在MongoDB），使用express-session来支持会话，connect-mongo用来把会话存储在MongoDB，使用connect-flash来实现会话flash消息，最后因为我比较偏好handlebars模板引擎，所以我使用express-handlebars来支持handlebars模板。首先安装这些模块：

``` shell
npm install passport, passport-local, express-session, connect-mongo, connect-flash, express-handlebars
```

Keystone是对express更抽象的封装，要在应用添加自己的路由处理、中间件，可以利用Keystone CLI接受的一个导出函数configureExpress来配置express，也可以像官方文档里描述的自定义服务。两者区别是前者是在 所有中间件加载之前配置express，而后者是在Keystone的中间件配置之后配置express。我采用的是第一种方式。整个实现最重要的是正确配置passport，以及利用Keystone生成的GraphQL服务查询用户信息。
下面的代码都在主文件index.js中，建users表的代码这里就不贴出来了，在新建项目时选择Starter项目，会有用户表创建的代码，这里主要讲如何集成自己应用的用户认证。
 
首先是session的配置，这里我把我的配置贴出来：

``` js
const express = require('express')
const session = require('express-session');
const SessionMongoStore = require('connect-mongo')(session);
const mxSessionConfig = {
  name: 'yourname.sid', //自己应用的作为session id 的cookie名称，建议定义
  resave: false, //因为使用的是配置器connect-mongo实现了touch方法，所以这里选false
  unset: 'destroy', //在req.session被删除时存储session的处理
  saveUninitialized: true,
  secret: 'mxgraph',
  cookie: { maxAge: 600000 },
  store: new SessionMongoStore({
    url: 'mongodb://localhost/yourcollection' //采用新的连接存储在MongoDB中
  })
};
```
下面是passport的配置，最重要的是正确配置验证策略和用户信息的序列化和反序列化。

配置验证策略：

``` js
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const userList = keystone.createList('User', UserSchema);
const { adapter: userListAdapter } = userList;

//因为keystone的graphql查询只能通过id来查询用户，这里采用用户表的适配器来查询用户，而不是新建扩展查询
passport.use(new LocalStrategy(
  function (username, password, done) {
    userListAdapter.findOne({ name: username }).then(function (user) {
      if (!user) {
        return done(null, false, { message: '不正确的用户名' });
      }
      const secretFieldInstance = userList.fieldsByPath['password'];
      secretFieldInstance.compare(password, user.password).then(function (result) {
        console.log('查询的用户信息', result, user);
        if (!result) {
          return done(null, false, { message: '密码不正确' });
        }
        return done(null, user);
      });
    });
  }
));
```

 到这里基本上就配置好了，req对象有session和user这两个对象，最后注册这两个中间件就可以了。最后再附上登录和注册的逻辑：

 ``` js
 module.exports = {
  configureExpress: app => {
  	app.use(session(mxSessionConfig));
	app.use(passport.initialize());
	app.use(passport.session());
    // 用户登录
    app.post('/login', function (req, res, next) {
      console.log('登录post请求', req.body);
      if (!req.body.username || !req.body.password) {
        req.flash('error', '请输入正确的用户名或密码');
        res.redirect('/login');
      } else {
        next();
      }
    }, passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    }));
    app.post('/signup', function (req, res, next) {
      console.log('注册请求', req.session, req.user);
      const userName = req.body.userName;
      const password = req.body.password;
      const user = keystone.executeQuery(
        `query searchforsignup($name: String) {
            _allUsersMeta(where: {name: $name}) {
              count
            }
          }`,
        {
          variables: {
            name: userName
          },
        }
      ).then(result => {
        console.log('查询用户', result.data._allUsersMeta.count);
        if (result.data._allUsersMeta.count === 0) {
          keystone.executeQuery(
            `mutation initialUser($password: String, $name: String) {
                  createUser(data: {name: $name, isAdmin: false, password: $password}) {
                    id
                    name
                    isAdmin
                    email
                  }
                }`,
            {
              variables: {
                password,
                name: userName,
              },
            }
          ).then(use => {
            console.log('创建返回', use.data.createUser);
            req.login(use.data.createUser, function (err) {
              if (err) { return next(err); }
              return res.redirect('/');
            });
            // res.redirect('/');
          });
        } else {
          req.flash('signup_error', '此用户名已经存在，请直接登录');
          res.redirect('/signup');
        }
      });
}}
```
