const NotImplementedException = require('../exception/notImplemented.exception');

class IModel {
  static getSchema() {
    throw new NotImplementedException('static getSchema');
  }

  static get DatabaseFolderPath() {
    return '../database';
  }

  static get Name() {
    return this.prototype.constructor.name.replace('Model', '').toLowerCase();
  }
}

module.exports = IModel;
