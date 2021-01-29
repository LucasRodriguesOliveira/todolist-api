const Joi = require('joi');

const BaseRoute = require('./base/base.route');
const Controller = require('../controller/task.controller');

class TaskRoute extends BaseRoute {
  constructor(db) {
    super(require('./base/task.config.json'), new Controller(db));
  }

  create(name) {
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
            idusuario: Joi.number().required(),
            titulo: Joi.string().max(32),
            descricao: Joi.string().max(150)
          })
        }
      ),
      async ({ payload }) => await this.controller.create(payload)
    );
  }

  readById(name) {
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
          })
        }
      ),
      async ({ params: { id } }) => await this.controller.read({ id })
    );
  }

  readByUserId(name) {
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
          })
        }
      ),
      async ({ params }) => await this.controller.readByUserId(params.id)
    );
  }

  update(name) {
    const [description, notes, path, { PATCH }, tags] = this.getInfo(name);

    return BaseRoute.getTemplate(
      path,
      PATCH,
      BaseRoute.getConfig(
        tags,
        description,
        notes,
        {
          payload: Joi.object({
            titulo: Joi.string().max(32).optional(),
            descricao: Joi.string().max(150).optional(),
            idusuario: Joi.number().optional(),
            concluido: Joi.boolean().optional(),
            ativo: Joi.boolean().optional(),
            excluido: Joi.boolean().optional()
          }),
          params: Joi.object({
            id: Joi.number().required()
          })
        }
      ),
      async ({ payload, params: { id } }) => await this.controller.update(id, payload)
    );
  }

  delete(name) {
    const [description, notes, path, { DELETE }, tags] = this.getInfo(name);

    return BaseRoute.getTemplate(
      path,
      DELETE,
      BaseRoute.getConfig(
        tags,
        description,
        notes,
        {
          params: Joi.object({
            id: Joi.number().required()
          })
        }
      ),
      async ({ params: { id } }) => await this.controller.delete(id)
    );
  }
}

module.exports = TaskRoute;