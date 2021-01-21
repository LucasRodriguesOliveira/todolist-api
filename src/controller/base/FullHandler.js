const IController = require('../../interface/IController.interface');

class FullHandler extends IController {
  #model;

  constructor(db, model) {
    super(db);
    this.Model = model;
  }

  get Model() {
    return this.#model;
  };

  set Model(m) {
    this.#model = m;
  }

  /**
   * @method
   * @public
   */
  async before() {
    if(!this.schema) {
      this.schema = await this.Database.defineModel(this.Model.getSchema(this.Database.name));
    }
    this.Database.Schema = this.schema;
  }

  /**
   * @method
   * @public
   * @param {Object} item object with values to include in table item
   */
  async create(item) {
    await this.before();
    const res = await this.Database.create(item);
    return res;
  }

  async read(query) {
    await this.before();
    return await this.Database.read(query);
  }

  async update(id, item) {
    await this.before();
    return await this.Database.update(id, item);
  }

  async delete(id) {
    await this.before();
    return await this.Database.delete(id);
  }
}

module.exports = FullHandler;
