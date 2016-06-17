var express = require('express');
var restify = require('restify');
var mime = require('mime-types');
var fs = require('fs');
var path = require('path');


var bindToExpress = function(options) {
  var paths = getPaths(options.path);

  // route to save the swagger file
  options.server.put(paths.SAVE_PATH, function (req, res, next) {
    var stream = fs.createWriteStream(options.file);
    stream.on('finish', function () {
      res.end('ok');
    });
    req.pipe(stream);
  });

  // serve the swagger-editor config
  options.server.get(paths.CONFIG, function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(getEditorConfig(options)));
  });

  // serve the swagger file
  options.server.use(paths.LOAD_PATH, express.static(options.file));

  // serve the swagger-editor static files
  options.server.use(paths.SERVE_PATH, express.static(paths.EDITOR_DIR));

  // serve the swagger-editor /dist/ files (needed because it tries to load /dist/ files from the root rather than from the base dir)
  options.server.use(paths.DIST_PATH, express.static(paths.EDITOR_DIR + '/dist/'));
};



var bindToRestify = function(options) {
  var paths = getPaths(options.path);

  // route to save the swagger file
  options.server.put(paths.SAVE_PATH, function (req, res, next) {
    var stream = fs.createWriteStream(options.file);
    stream.on('finish', function () {
      res.end('ok');
    });
    req.pipe(stream);
  });

  // serve the swagger-editor config
  options.server.get(paths.CONFIG, function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(getEditorConfig(options));
  });

  // serve the swagger file
  options.server.get(paths.LOAD_PATH, function(req, res, next) {
    fs.readFile(options.file, function (err, content) {
      if (err) {
        res.send(500);
        return next();
      }

      var contentType = mime.lookup(options.file);
      if(contentType != false) {
        res.setHeader('Content-Type', contentType);
      }

      res.write(content);
      res.end();
    });
  });

  // serve the swagger-editor static files
  var re = new RegExp('^'+paths.SERVE_PATH+'.*$');
  options.server.get(re, function (req, res, next) {
    var requestFilename = req.path().substring(paths.SERVE_PATH.length).trim();
    if(requestFilename.length == 0 || requestFilename == '/') {
      requestFilename = 'index.html';
    }
    var staticFile = paths.EDITOR_DIR + '/' + requestFilename;

    fs.readFile(staticFile, function (err, content) {
      if (err) {
        res.send(500);
        return next();
      }

      var contentType = mime.lookup(requestFilename);
      if(contentType != false) {
        res.setHeader('Content-Type', contentType);
      }

      res.write(content);
      res.end();
    });
  });

  // serve the swagger-editor /dist/ files (needed because it tries to load /dist/ files from the root rather than from the base dir)
  re = new RegExp('^'+paths.DIST_PATH+'.*$');
  options.server.get(re, restify.serveStatic({
    directory: paths.EDITOR_DIR
  }));
};



var getEditorConfig = function(options) {
  if(typeof options.config != 'undefined') {
    return options.config;
  }

  return {
    "disableCodeGen": true,
    "autocompleteExtension": {},
    "useBackendForStorage": true,
    "backendThrottle": 200,
    "keyPressDebounceTime": 200,
    "backendEndpoint": options.path + "/editor/spec",
    "useYamlBackend": true,
    "disableFileMenu": true,
    "headerBranding": false,
    "disableNewUserIntro": true,
    "enableTryIt": true,
    "brandingCssClass": "",
    "importProxyUrl": "https://cors-it.herokuapp.com/?url="
  };
};



var getPaths = function(base) {
  return {
    CONFIG: base + '/config/defaults.json',
    SERVE_PATH: base + '/',
    DIST_PATH: '/dist/',
    LOAD_PATH: base + '/editor/spec',
    SAVE_PATH: base + '/editor/spec',
    EDITOR_DIR: path.resolve(__dirname, '../swagger-editor')
  };
};



module.exports = {
  express: bindToExpress,
  restify: bindToRestify
};