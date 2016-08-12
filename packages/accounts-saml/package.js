Package.describe({
  summary: "Test",
  version: "1.1.0",
  name: "test",
  git: "ssh://git@git.barco.com:7999/ED/blue.git"
});

//NPM Dependencies
Npm.depends({
  "connect": "2.7.10",
});


Package.onUse(function(api) {
  api.versionsFrom('1.4.0.1');

  api.imply([]);

  api.use([
    'routepolicy',
    'webapp',
    'service-configuration',
    'check',
    'underscore',
      'ecmascript',
    "standard-minifiers",
    'aldeed:simple-schema@1.5.3'
  ], 'server');

  api.use([
    'http',
    'accounts-base',
    'ecmascript'
  ], ['client', 'server']);

  // PACKAGES FOR SERVER
  api.use([], {weak:true});
  // UNORDERED DEPENDENCIES (to solve
  api.use([], {unordered:true});


  api.mainModule('server/main.js', 'server');

  //EXPORT VARIABLES
  api.export([]);

});

Package.onTest(function (api) {});
