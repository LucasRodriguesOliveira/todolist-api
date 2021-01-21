const Handler = require('./base/FullHandler');
const { HashPassword, ComparePassword } = require('../helper/passwordHelper');
const { Ok } = require('../helper/util');
const Jwt = require('jsonwebtoken');
const Boom = require('@hapi/boom');
const { USR_NOT_FOUND, PSWD_INVALID } = require('./base/user.controller.strings.json');

class UserController extends Handler {
  #Secret;

  constructor(db, secret) {
    super(db, require('../model/usuario.model'));

    this.#Secret = secret;
  }

  async create(item) {
    const hashPassword = await HashPassword(item.senha);
    return await super.create({...item, senha: hashPassword});
  }

  async login(email, password) {
    const [usr] = await this.read({ email });
    if(!usr) {
      return Boom.unauthorized(USR_NOT_FOUND);
    }

    const match = await ComparePassword(
      password, usr.senha
    );

    if(!match) {
      return Boom.unauthorized(PSWD_INVALID);
    }

    const token = Jwt.sign({ email, id: usr.id }, this.#Secret);
    return Ok({ token });
  }
}

module.exports = UserController;
