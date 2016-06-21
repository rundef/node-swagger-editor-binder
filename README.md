# swagger-editor-binder

[![npm version](https://badge.fury.io/js/swagger-editor-binder.svg)](http://badge.fury.io/js/swagger-editor-binder) 

Binds the swagger editor to an express (or restify) route

## Installation

> npm i swagger-editor-binder

## Usage

### With express

```javascript
var express = require('express');
var swaggerEditorBinder = require('swagger-editor-binder');
var path = require('path');

var app = express();

swaggerEditorBinder.express({
  server: app,
  path: '/edit',
  file: path.resolve(__dirname, 'swagger.yaml')
});

app.listen(3000, function () {
  console.log('Swagger editor @ http://localhost:3000/edit/');
});
```

### With restify

```javascript
var restify = require('restify');
var path = require('path');
var swaggerEditorBinder = require('swagger-editor-binder');

var app = restify.createServer();

swaggerEditorBinder.restify({
  server: app,
  path: '/edit',
  file: path.resolve(__dirname, 'swagger.yaml')
});

app.listen(3000, function() {
  console.log('Swagger editor @ http://localhost:3000/edit/');
});
```