const Joi = require('joi');

const BaseRoute = require('./base/base.route');
const Controller = require('../controller/item.controller');

class ItemRoute extends BaseRoute {
  constructor(db) {
    super(require('./base/item.config.json'), new Controller(db));
  }

  create(name) {
    const [description, notes, path, { POST }, tags] = this.getInfo(name);
    const default_description = this.strings.novo;

    return BaseRoute.getTemplate(
      path,
      POST,
      BaseRoute.getConfig(
        tags,
        description,
        notes,
        {
          payload: Joi.object({
            descricao: Joi.string().max(50).default(default_description),
            concluido: Joi.boolean().default(false),
            idtarefa: Joi.number().required()
          })
        }
      ),
      async ({ payload }) => {
        return await this.controller.create(payload);
      }
    );
  }

  readByTaskId(name) {
    const [description, notes, path, { GET }, tags] = this.getInfo(name);

    return BaseRoute.getTemplate(
      path,
      GET,
      BaseRoute.getConfig(
        tags,
        description,
        notes,
        {
          params: Joi.object({
            id: Joi.number().required()
          }),
        }
      ),
      async ({ params }) => {
        return await this.controller.readByTaskId(params.id);
      }
    );
  }

  updateItem(name) {
    const [description, notes, path, { PUT }, tags] = this.getInfo(name);

    return BaseRoute.getTemplate(
      path,
      PUT,
      BaseRoute.getConfig(
        tags,
        description,
        notes,
        {
          payload: Joi.object({
            descricao: Joi.string().max(50),
            concluido: Joi.boolean().default(false)
          }),
          params: Joi.object({
            id: Joi.number().required()
          })
        }
      ),
      async ({ payload, params }) => await this.controller.update(params.id, payload)
    );
  }

  deleteItem(name) {
    const [description, notes, path, { DELETE }, tags] = this.getInfo(name);

    return BaseRoute.getTemplate(
      path,
      DELETE,
      BaseRoute.getConfig(
        tags,
        description,
        notes,
        { params: Joi.object({ id: Joi.number().required() }) }
      ),
      async req => await this.controller.exclude(req.params)
    );
  }
}

module.exports = ItemRoute;
