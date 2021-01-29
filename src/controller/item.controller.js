const Handler = require('./base/FullHandler');

/**
 * @class
 * @extends IController
 * @public
 */
class ItemController extends Handler {
  /**
   * @constructor
   * @public
   * @param {IDatabase} db database to be used by application
   */
  constructor(db) {
    super(db, require('../model/item.model'));
  }

  async readByTaskId(idTarefa) {
    await super.before();
    return await this.Database.read({ idTarefa });
  }

  async exclude({ id }) {
    return await this.update(id, { excluido: true });
  }
}

module.exports = ItemController;
