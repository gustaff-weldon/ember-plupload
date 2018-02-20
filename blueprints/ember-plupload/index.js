var RSVP = require('rsvp');

module.exports = {
  normalizeEntityName: function () {},

  afterInstall: function () {
    return this.addBowerPackageToProject('plupload', 'https://github.com/synaptiko/plupload/archive/v2.1.9-bayzat.tar.gz').then(() => {
      return this.addBowerPackageToProject('dinosheets', '0.1.1');
    })
  }
};
