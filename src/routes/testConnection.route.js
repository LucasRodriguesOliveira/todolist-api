const BaseRoute = require('./base/base.route');
const Controller = require('../controller/testConnection.controller');

class Test extends BaseRoute {
  #secret = Object.create(null);

  constructor(secret) {
    super(require('./base/testConnection.config.json'), new Controller());
    this.#secret = secret;
  }

  testConnection(name) {
    const {
      _default: { tags},
      _method
    } = this;
    const { description, notes, path } = this.routes[name];

    return BaseRoute.getTemplate(
      path,
      _method.GET,
      BaseRoute.getConfig(tags, description, notes),
      () => this.controller.getStatus()
    );
  }
}

module.exports = Test;
