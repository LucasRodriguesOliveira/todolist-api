const ICrud = require('../../interface/ICrud.interface');
const { setRequiredParameter } = require('../../helper/util');
const { context: { databases, dbNotFoundMsg } } = require('./config.json');

class Context extends ICrud {
  #database = {};

  constructor(db) {
    super();
    this.#database = db;
    this.name = db.name;
  }

  async create(item = setRequiredParameter('item')) {
    return await this.#database.create(item);
  }

  async read(query = setRequiredParameter('query')) {
    return await this.#database.read(query);
  }

  async update(id = setRequiredParameter('id'), item = setRequiredParameter('item')) {
    return await this.#database.update(id, item);
  }

  async delete(id = setRequiredParameter('id')) {
    return await this.#database.delete(id);
  }

  async destroy(id = setRequiredParameter('id')) {
    return await this.#database.destroy(id);
  }

  async truncate(query = setRequiredParameter('query')) {
    return await this.#database.truncate(query);
  }

  isConnected() {
    return this.#database.isConnected();
  }

  static connect() {
    return this.#database.connect();
  }

  async defineModel(
    name = setRequiredParameter('name'),
    schema = setRequiredParameter('name'),
    options = setRequiredParameter('name')
  ) {
    return await this.#database.defineModel(name, schema, options);
  }

  set Schema(schema) {
    this.#database.Schema = schema;
  }

  get Schema() {
    return this.#database.Schema;
  }

  static createContext(database = setRequiredParameter('database')) {
    if(databases.includes(database)) {
      const db = require(`../${database}/${database}.database`);
      return new Context(new db(db.connect()));
    }

    throw new Error(dbNotFoundMsg);
  }
}

module.exports = Context;