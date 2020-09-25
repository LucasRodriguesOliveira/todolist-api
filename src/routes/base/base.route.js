const Joi = require('joi');
const Config = require('./config.json');

class BaseRoute {
  constructor(childConfig, controller) {
    this.config = Config;
    this.childConfig = childConfig;
    this.controller = controller;
    
    this._method = this.config.methods;
    this._default = this.config.defaultValues;

    this.name = this.childConfig.name;
    this.path = this.childConfig.path;
    this.routes = this.childConfig.routes;
    this.strings = this.childConfig.strings;
  }

  static methods() {
    return Object.getOwnPropertyNames(this.prototype).filter(
      m => ('constructor' !== m) && (!m.startsWith('_'))
    );
  }

  static getConfig(tags, description, notes, options) {
    const failAction = (request, headers, error) => {
      throw error;
    };

    const headers = Joi.object({
      authorization: Joi.string().required()
    }).unknown();

    const validate = { failAction };

    if(options) {
      if(options.payload) validate.payload = options.payload;
      if(options.query) validate.query = options.query;
      if(options.params) validate.params = options.params;
      if(options.auth) validate.headers = headers;
    }

    return { tags, description, notes, validate };
  }

  static getTemplate(path, method, config, handler) {
    const template = {};

    if(path) template.path = path;
    if(method) template.method = method;
    if(config) template.config = config;
    if(handler) template.handler = handler;

    return template;
  }
}

module.exports = BaseRoute;
