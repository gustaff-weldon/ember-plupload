var RSVP = require('rsvp');

module.exports = {
  normalizeEntityName: function () {},

  afterInstall: function () {
    return this.addBowerPackageToProject('plupload', 'v2.1.8').then(() => {
      return this.addBowerPackageToProject('dinosheets', '0.1.1');
    })
  }
};
