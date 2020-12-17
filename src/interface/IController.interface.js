const ICrud = require('./ICrud.interface');
const NotImplementedException = require('../exception/notImplemented.exception');

class IController extends ICrud {
  #database = {};

  constructor(database) {
    this.#database = database;
  }

  get Database() {
    return this.#database;
  }

  readById() {
    throw new NotImplementedException('readById');
  }
}

module.exports = IController;