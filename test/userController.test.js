const { expect } = require('chai');
const ItemModel = require('../src/model/item.model');
const UsuarioModel = require('../src/model/usuario.model');
const TarefaModel = require('../src/model/tarefa.model');
const Context = require('../src/database/base/context');
const Controller = require('../src/controller/user.controller');
const { USUARIO, TAREFA, ITEM } = require('./helper/dataMock.json');
const Jwt = require('jsonwebtoken');

// * Configure Environment
if(!globalThis.envSetup){
  const { configEnviroment } = require('../src/helper/config');
  configEnviroment(process.env.NODE_ENV);
  globalThis.envSetup = true;
}

describe.only('User test suite', function () {
  this.timeout(Infinity);
  this.slow(500);
  let database = {};
  let controller = {};
  let usuarioSchema = {};
  let tarefaSchema = {};
  let itemSchema = {};
  let objectsToDelete = [];

  const create = async o => (await database.create(o)).id;

  const createUsuario = async usuario => {
    database.Schema = usuarioSchema;
    return create(usuario);
  }

  const createTarefa = async tarefa => {
    database.Schema = tarefaSchema;
    return create(tarefa);
  }

  const createItem = async item => {
    database.Schema = itemSchema;
    return create(item);
  }

  const addToExclude = o => {
    const props = Object.getOwnPropertyNames(o);
    const schema = props.includes('idUsuario')
      ? tarefaSchema
      : props.includes('idTarefa') ? itemSchema : usuarioSchema;
    objectsToDelete.push({ schema, id: o.id });
  }

  const deleteItemsCreated = async () => {
    objectsToDelete.reverse();

    await objectsToDelete.forEach(async obj => {
      database.Schema = obj.schema;
      await database.delete(obj.id);
    });

    objectsToDelete = [];
  }
  
  this.beforeAll(async () => {
    database = Context.createContext(process.env.DATABASE);
    controller = new Controller(
      Context.createContext(process.env.DATABASE),
      process.env.SECRET
    );

    usuarioSchema = await database.defineModel(UsuarioModel.getSchema(database.name));
    tarefaSchema = await database.defineModel(TarefaModel.getSchema(database.name));
    itemSchema = await database.defineModel(ItemModel.getSchema(database.name));
  });

  this.afterAll(async () => { await deleteItemsCreated(); });

  describe('Create', function () {
    it('Creates a new user', async () => {
      const res = await controller.create(USUARIO);
      addToExclude(res);

      expect(res).to.not.null;
      expect(res).to.have.property('nome', USUARIO.nome);
      expect(res).to.have.property('email', USUARIO.email);
      expect(res).to.not.have.property('senha', USUARIO.senha);
    });
  });

  describe('Login', function() {
    let usr;

    this.beforeAll(async () => {
      const id = await createUsuario(USUARIO);

      database.Schema = usuarioSchema;
      usr = (await database.read({ id }))[0];
      addToExclude({ id });
    });

    it('Successfully Logs in a user and retrieve jwt hash', async () => {
      const { data: { token } } = await controller.login(usr.email, usr.senha);

      expect(token).to.be.a('string');
      expect(Jwt.verify(token, process.env.SECRET))
        .to.have.property('email', usr.email);
    });

    it('Login fails', async () => {
      const statusCode = 401;
      const error = 'Unauthorized';
      const message = 'E-mail ou senha inválido';

      const { output: { payload } } = await controller.login(usr.email, '');

      expect(payload).to.have.property('statusCode', statusCode);
      expect(payload).to.have.property('error', error);
      expect(payload).to.have.property('message', message);
    });
  });
});