'use strict';

const fs = require('fs');
const path = require('path');
const osenv = require('osenv');
const mkdirp = require('mkdirp');

const home = osenv.home();
const settingsPath = path.join(home, '.nodemailapp');

const paths = {
  home: home,
  settingsPath: settingsPath,
  dataPath: path.join(settingsPath, 'data'),
  logPath: path.join(settingsPath, 'log')
};

Object.keys(paths).forEach(function(key){ mkdirp.sync(paths[key]); });

module.exports = paths;
