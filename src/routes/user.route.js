const Joi = require('joi');

const BaseRoute = require('./base/base.route');
const Controller = require('../controller/user.controller');

class UserRoute extends BaseRoute {
  constructor(db, SECRET) {
    super(require('./base/user.config.json'), new Controller(db, SECRET));
  }

  login(name) {
    const [description, notes, path, { POST }, tags] = this.getInfo(name);

    return BaseRoute.getTemplate(
      path,
      POST,
      BaseRoute.getConfig(
        tags,
        description,
        notes,
        {
          payload: Joi.object({
            email: Joi.string().email().max(100).required(),
            senha: Joi.string().max(32).required()
          })
        }
      ),
      async ({ payload: { email, senha } }) => await this.controller.login(email, senha)
    );
  }

  register(name) {
    const [description, notes, path, { POST }, tags] = this.getInfo(name);

    return BaseRoute.getTemplate(
      path,
      POST,
      BaseRoute.getConfig(
        tags,
        description,
        notes,
        {
          payload: Joi.object({
            nome: Joi.string().max(60).required(),
            email: Joi.string().email().max(150).required(),
            senha: Joi.string().max(32).required()
          })
        }
      ),
      async ({ payload }) => await this.controller.register(payload)
    );
  }
}

module.exports = UserRoute;
