/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var MergeTrees = require('broccoli-merge-trees');
var FileCreator = require('broccoli-file-creator');

function findRoot(current) {
  var app;

  // Keep iterating upward until we don't have a grandparent.
  // Has to do this grandparent check because at some point we hit the project.
  do {
    app = current.app || app;
  } while (current.parent && current.parent.parent && (current = current.parent));

  return app;
}

module.exports = {
  name: 'ember-get-config',

  treeForAddon: function(inputTree) {
    var modulePrefix = findRoot(this).project.config(process.env.EMBER_ENV)['modulePrefix'];
    var fileTree = new FileCreator('index.js', 'export { default } from \'' + modulePrefix + '/config/environment\';');
    return this._super.treeForAddon.call(this, new MergeTrees([inputTree, fileTree], { overwrite: true }));
  },

  _includeCount: 0,

  included: function() {
    this._includeCount++;
    if (this._includeCount > 1) {
      findRoot(this).project.ui.writeDeprecateLine('`ember-get-config` previously recommended reinvoking the `included` hook, but that is no longer recommended. Please remove the additional invocation.');
    }
  }
};
