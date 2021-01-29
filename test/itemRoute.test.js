const { expect } = require('chai');
const { USUARIO, TAREFA, ITEM } = require('./helper/dataMock.json');

require('./helper/before')();

describe('Item Route test suite', function () {
  let app;

  const UserController = require('../src/controller/user.controller');
  const TaskController = require('../src/controller/task.controller');
  const ItemController = require('../src/controller/item.controller');
  const Context = require('../src/database/base/context');
  const Server = require('../src/server');

  let userController = {};
  let taskController = {};
  let itemController = {};
  
  this.beforeAll(async () => {
    const db = Context.createContext(process.env.DATABASE);
    userController = new UserController(db, process.env.SECRET);
    taskController = new TaskController(db);
    itemController = new ItemController(db);

    app = await Server;
  });

  this.afterAll(async () => { await app.stop({ timeout: 0 }); });

  describe('Create Item', function() {
    let usr = {};
    let task = {};
    let item = {};

    this.beforeAll(async () => {
      usr = await userController.create(USUARIO);
      task = await taskController.create({...TAREFA, idusuario: usr.id});
    });

    this.afterAll(async () => {
      await itemController.delete(item.id);
      await taskController.delete(task.id);
      await userController.delete(usr.id);
    });

    it('Creates one item', async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/item',
        payload: {...ITEM, idtarefa: task.id}
      });

      item = JSON.parse(payload);0

      expect(item).to.have.property('id');
      expect(item).to.have.property('descricao');
    });
  });

  describe('Read Item', function() {
    let usr = {};
    let task = {};
    let item = {};

    this.beforeAll(async () => {
      usr = await userController.create(USUARIO);
      task = await taskController.create({...TAREFA, idusuario: usr.id});
      item = await itemController.create({...ITEM, idtarefa: task.id});
    });

    this.afterAll(async () => {
      await itemController.delete(item.id);
      await taskController.delete(task.id);
      await userController.delete(usr.id);
    });

    it('Reads all items from task id', async () => {
      const { payload } = await app.inject({
        method: 'GET',
        url: `/item/task/${task.id}`
      });

      const res = JSON.parse(payload);
      expect(res).to.be.an('array').with.length.greaterThan(0);
      expect(res[0]).to.have.property('id', item.id);
      expect(res[0]).to.have.property('idtarefa', item.idtarefa);
    });
  });

  describe('Update Item', function() {
    let usr = {};
    let task = {};
    let item = {};

    this.beforeAll(async () => {
      usr = await userController.create(USUARIO);
      task = await taskController.create({...TAREFA, idusuario: usr.id});
      item = await itemController.create({...ITEM, idtarefa: task.id});
    });

    this.afterAll(async () => {
      await itemController.delete(item.id);
      await taskController.delete(task.id);
      await userController.delete(usr.id);
    });

    it('Updates task item description', async () => {
      const { concluido, id } = item;
      const NEW_ITEM = {
        descricao: 'Descrição atualizada',
        concluido
      };

      const { payload } = await app.inject({
        method: 'PUT',
        url: `/item/${id}`,
        payload: NEW_ITEM
      });

      const res = JSON.parse(payload);
      const [itemUpdated] = await itemController.read({ id });

      expect(res).to.be.a('array').that.have.property('0', 1);
      expect(itemUpdated).to.have.property('id', id);
      expect(itemUpdated).to.have.property('idtarefa', item.idtarefa);
      expect(itemUpdated).to.have.property('descricao', NEW_ITEM.descricao);
      expect(itemUpdated).to.have.property('concluido', NEW_ITEM.concluido);
      expect(itemUpdated).to.not.have.property('dataatualizacao', item.dataatualizacao);
    });

    it('Updates task item conclusion', async () => {
      const { descricao, id } = item;
      const NEW_ITEM = {
        descricao,
        concluido: true
      };

      const { payload } = await app.inject({
        method: 'PUT',
        url: `/item/${id}`,
        payload: NEW_ITEM
      });

      const res = JSON.parse(payload);
      const [itemUpdated] = await itemController.read({ id });

      expect(res).to.be.a('array').that.have.property('0', 1);
      expect(itemUpdated).to.have.property('id', id);
      expect(itemUpdated).to.have.property('idtarefa', item.idtarefa);
      expect(itemUpdated).to.have.property('descricao', NEW_ITEM.descricao);
      expect(itemUpdated).to.have.property('concluido', NEW_ITEM.concluido);
      expect(itemUpdated).to.not.have.property('dataatualizacao', item.dataatualizacao);
    });
  });

  describe('Delete Item', function () {
    let usr = {};
    let task = {};
    let item = {};

    this.beforeAll(async () => {
      usr = await userController.create(USUARIO);
      task = await taskController.create({...TAREFA, idusuario: usr.id});
      item = await itemController.create({...ITEM, idtarefa: task.id});
    });

    this.afterAll(async () => {
      await itemController.delete(item.id);
      await taskController.delete(task.id);
      await userController.delete(usr.id);
    });

    it('Deletes task item by updating "excluido" field to true', async () => {
      const { payload } = await app.inject({
        method: 'DELETE',
        url: `/item/${item.id}`
      });

      const res = JSON.parse(payload);
      const [itemUpdated] = await itemController.read({ id: item.id });

      expect(res).to.be.an('array').with.lengthOf(1);
      expect(res).to.have.property('0', 1);
      expect(itemUpdated).to.have.property('id', item.id);
      expect(itemUpdated).to.have.property('excluido').that.is.true;
    });
  });
});
