const { expect } = require('chai');
const { USUARIO } = require('./helper/dataMock.json');
const Jwt = require('jsonwebtoken');

require('./helper/before')();

describe('User Route test suite', function() {
  this.timeout(Infinity);
  let app;

  const UserController = require('../src/controller/user.controller');
  const Context = require('../src/database/base/context');
  const Server = require('../src/server');

  let userController = {};
  
  this.beforeAll(async () => {
    const db = Context.createContext(process.env.DATABASE);
    userController = new UserController(db, process.env.SECRET);

    app = await Server;
  });

  this.afterAll(async () => { await app.stop({ timeout: 0 }); });

  describe('Register', function() {
    let user = {};

    this.afterAll(async () => {
      await userController.delete(user.id);
    });

    it('Creates a new user account', async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/register',
        payload: USUARIO
      });

      user = JSON.parse(payload);

      expect(user).to.be.not.null;
      expect(user).to.be.not.undefined;
      expect(user).to.be.an('object');
      expect(user).to.have.property('id');
      expect(user).to.have.property('nome', USUARIO.nome);
      expect(user).to.have.property('email', USUARIO.email);
      expect(user).to.have.property('senha').that.is.not.equal(USUARIO.senha);
      expect(user).to.have.property('ativo').that.is.true;
      expect(user).to.have.property('excluido').that.is.false;
      expect(user).to.have.property('datacriacao');
      expect(user).to.have.property('dataatualizacao');
    });
  });

  describe('Login', function() {
    let user = {};

    this.beforeAll(async () => {
      user = await userController.register(USUARIO);
    });

    this.afterAll(async () => {
      await userController.delete(user.id);
    });

    it('Loggs in user to his account and receive token access', async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          email: user.email,
          senha: USUARIO.senha
        }
      });

      const res = JSON.parse(payload);

      expect(res).to.be.not.null;
      expect(res).to.be.not.undefined;
      expect(res).to.have.deep.nested.property('data.token')
        .that.is.a('string');
      expect(Jwt.verify(res.data.token, process.env.SECRET))
        .to.have.property('email', user.email);
    });
  });
});
