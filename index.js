/* jshint node: true */
'use strict';

// For ember-cli < 2.7 findHost doesnt exist so we backport from that version
// for earlier version of ember-cli.
// https://github.com/ember-cli/ember-cli/blame/16e4492c9ebf3348eb0f31df17215810674dbdf6/lib/models/addon.js#L533
function findHostShim() {
  let current = this;
  let app;
  do {
    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));
  return app;
}

module.exports = {
  name: 'ember-plupload',

  included: function (/* appOrAddon */) {
    this._super.included.apply(this, arguments);

    let findHost = this._findHost || findHostShim;
    let app = findHost.call(this);

    this.app = app;

    var config = this.app.project.config(app.env) || {};
    var addonConfig = config[this.name] || {};
    var debugMode = addonConfig.debug;

    if (debugMode === undefined) {
      debugMode = process.env.EMBER_ENV === 'development';
    }

    if (!process.env.EMBER_CLI_FASTBOOT) {
      if (debugMode) {
        app.import('bower_components/plupload/js/moxie.js');
        app.import('bower_components/plupload/js/plupload.dev.js');
      } else {
        app.import('bower_components/plupload/js/plupload.full.min.js');
      }
    }
    app.import('bower_components/plupload/js/Moxie.swf', {
      destDir: 'assets'
    });
    app.import('bower_components/plupload/js/Moxie.xap', {
      destDir: 'assets'
    });
    app.import('bower_components/dinosheets/dist/dinosheets.amd.js', {
      exports: {
        'dinosheets': ['default']
      }
    });

    app.import('vendor/styles/ember-plupload.css');
  }
};
