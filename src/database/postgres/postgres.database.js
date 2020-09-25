const IDatabase = require('../../interface/IDatabase.interface');
const Sequelize = require('sequelize');
const { postgres: CONFIG } = require('../base/config.json');

class Postgres extends IDatabase {
  #schema = {};

  constructor(connection) {
    super(CONFIG.name, connection);
  }

  static connect() {
    const {
      POSTGRES_DATABASE: db,
      POSTGRES_USERNAME: user,
      POSTGRES_PASSWORD: pass,
      POSTGRES_HOST: host,
      POSTGRES_PORT: port,
      POSTGRES_DIALECT: dialect
    } = process.env;
    const { quoteIdentifiers, operatorAliases, logging } = CONFIG;
    const opts = { host, port, dialect, quoteIdentifiers, operatorAliases, logging };

    return new Sequelize(db, user, pass, opts);
  }

  async isConnected() {
    try {
      await this.connection.authenticate();
      return true;
    } catch(err) {
      console.error(`Ocorreu um erro: [${err}]`);
      return false;
    }
  }

  async defineModel(name, schema, options) {
    const model = this.connection.define(name, schema, options);
    await model.sync();

    return model;
  }

  set Schema(schema) {
    this.#schema = schema;
  }

  get Schema() {
    return this.#schema;
  }

  async create(item) {
    const { dataValues } = await this.#schema.create(item);
    return dataValues;
  }

  async read(query) {
    return await this.#schema.findAll({ where: query, raw: CONFIG.raw });
  }

  async update(id, item) {
    return await this.#schema.update(item, { where: { id } });
  }

  async delete(id) {
    return await this.#schema.destroy({ where: id ? { id } : {} });
  }
}

module.exports = Postgres;