// package.js
// Author: Joel Lubrano
// Meteor package configuration file

Package.describe({
  summary: "A plugin to the Datamaps library that provides support for zooming.",
  version: "0.0.1",
  name: "jdlubrano:datamaps-zoomto",
  git: "https://github.com/jdlubrano/datamaps-zoomto-plugin.git"
});

Package.onUse(function(api) {
  api.versionsFrom('0.9.0');
  api.use('hyperborea:datamaps', 'client');
  api.imply('hyperborea:datamaps', 'client');
  api.addFiles(['build/datamaps-zoomto.js'], 'client');
});

Package.onTest(function(api) {
  api.use("jdlubrano:datamaps-zoomto");
  api.use(["tinytest", "test-helpers"]);
  api.addFiles("tests/tinytest/plugin-is-defined-test.js", "client");
});

