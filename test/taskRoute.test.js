const { expect } = require('chai');
const { USUARIO, TAREFA } = require('./helper/dataMock.json');

require('./helper/before')();

describe('Task route test suite', function() {
  this.timeout(Infinity);
  let app;

  const UserController = require('../src/controller/user.controller');
  const TaskController = require('../src/controller/task.controller');
  const Context = require('../src/database/base/context');
  const Server = require('../src/server');

  let userController = {};
  let taskController = {};
  
  this.beforeAll(async () => {
    const db = Context.createContext(process.env.DATABASE);
    userController = new UserController(db, process.env.SECRET);
    taskController = new TaskController(db);

    app = await Server;
  });

  this.afterAll(async () => { await app.stop({ timeout: 0 }); });

  describe('Create Task', function() {
    let usr = {};
    let task = {};

    this.beforeAll(async () => {
      usr = await userController.register(USUARIO);
    });

    this.afterAll(async () => {
      await taskController.delete(task.id);
      await userController.delete(usr.id);
    });

    it('Creates one task', async () => {
      const { payload } = await app.inject({
        method: 'POST',
        url: '/task',
        payload: {
          ...TAREFA,
          idusuario: usr.id
        }
      });

      task = JSON.parse(payload);
      
      expect(task).to.be.not.null;
      expect(task).to.be.not.undefined;
      expect(task).to.be.an('object');
      expect(task).to.have.property('id').that.is.a('number');
      expect(task).to.have.property('titulo', TAREFA.titulo);
      expect(task).to.have.property('descricao', TAREFA.descricao);
      expect(task).to.have.property('idusuario', usr.id);
      expect(task).to.have.property('datacriacao');
      expect(task).to.have.property('dataatualizacao');
      expect(task).to.have.property('concluido').that.is.false;
      expect(task).to.have.property('excluido').that.is.false;
      expect(task).to.have.property('ativo').that.is.true;
    });
  });

  describe('Read', function() {
    let usr = {};
    let task = {};

    this.beforeAll(async () => {
      usr = await userController.register(USUARIO);
      task = await taskController.create({...TAREFA, idusuario: usr.id});
    });

    this.afterAll(async () => {
      await taskController.delete(task.id);
      await userController.delete(usr.id);
    });

    it('Reads one task by id', async () => {
      const { payload } = await app.inject({
        method: 'GET',
        url: `/task/${task.id}`
      });

      const res = JSON.parse(payload);

      expect(res).to.be.an('array').that.have.lengthOf(1);
      expect(res).to.have.nested.property('0.id', task.id);
      expect(res).to.have.nested.property('0.idusuario', usr.id);
      expect(res).to.have.nested.property('0.titulo', TAREFA.titulo);
      expect(res).to.have.nested.property('0.descricao', TAREFA.descricao);
      expect(res).to.have.nested.property('0.datacriacao');
      expect(res).to.have.nested.property('0.dataatualizacao');
      expect(res).to.have.nested.property('0.ativo').that.is.true;
      expect(res).to.have.nested.property('0.concluido').that.is.false;
      expect(res).to.have.nested.property('0.excluido').that.is.false;
    });

    it('Reads all tasks by user id', async () => {
      const { payload } = await app.inject({
        method: 'GET',
        url: `/task/user/${usr.id}`
      });

      const res = JSON.parse(payload);

      expect(res).to.be.an('array').that.have.length.greaterThan(0);
      expect(res).to.have.nested.property('0.id', task.id);
      expect(res).to.have.nested.property('0.idusuario', usr.id);
      expect(res).to.have.nested.property('0.titulo', TAREFA.titulo);
      expect(res).to.have.nested.property('0.descricao', TAREFA.descricao);
      expect(res).to.have.nested.property('0.datacriacao');
      expect(res).to.have.nested.property('0.dataatualizacao');
      expect(res).to.have.nested.property('0.ativo').that.is.true;
      expect(res).to.have.nested.property('0.concluido').that.is.false;
      expect(res).to.have.nested.property('0.excluido').that.is.false;
    });
  });

  describe('Update Task', function() {
    let usr = {};
    let task = {};

    const method = 'PATCH';
    let url = '/task/id';

    this.beforeAll(async () => {
      usr = await userController.register(USUARIO);
    });

    this.beforeEach(async () => {
      task = await taskController.create({...TAREFA, idusuario: usr.id});
      url = `/task/${task.id}`;
    });

    this.afterEach(async () => {
      await taskController.delete(task.id);
    });

    this.afterAll(async () => {
      await userController.delete(usr.id);
    });

    it('Updates task titulo field', async () => {
      const titulo = 'NOVO TITULO';
      const { payload } = await app.inject({
        method, url,
        payload: {
          ...TAREFA,
          idusuario: task.idusuario,
          titulo
        }
      });
      const res = JSON.parse(payload);
      const [taskUpdated] = await taskController.read({ id: task.id });

      expect(res).to.be.an('array').with.lengthOf(1);
      expect(res).to.have.nested.property('0', 1);
      expect(taskUpdated).to.be.not.undefined;
      expect(taskUpdated).to.be.not.null;
      expect(taskUpdated).to.be.an('object');
      expect(taskUpdated).to.have.property('id', task.id);
      expect(taskUpdated).to.have.property('idusuario', task.idusuario);
      expect(taskUpdated).to.have.property('titulo', titulo);
      expect(taskUpdated).to.have.property('descricao', task.descricao);
      expect(taskUpdated).to.have.property('concluido', task.concluido);
      expect(taskUpdated).to.have.property('ativo', task.ativo);
      expect(taskUpdated).to.have.property('excluido', task.excluido);
    });

    it('Updates task descricao field', async () => {
      const descricao = 'NOVA DESCRICAO';
      const { payload } = await app.inject({
        method, url,
        payload: {
          ...TAREFA,
          idusuario: task.idusuario,
          descricao
        }
      });
      const res = JSON.parse(payload);
      const [taskUpdated] = await taskController.read({ id: task.id });

      expect(res).to.be.an('array').with.lengthOf(1);
      expect(res).to.have.nested.property('0', 1);
      expect(taskUpdated).to.be.not.undefined;
      expect(taskUpdated).to.be.not.null;
      expect(taskUpdated).to.be.an('object');
      expect(taskUpdated).to.have.property('id', task.id);
      expect(taskUpdated).to.have.property('idusuario', task.idusuario);
      expect(taskUpdated).to.have.property('titulo', task.titulo);
      expect(taskUpdated).to.have.property('descricao', descricao);
      expect(taskUpdated).to.have.property('concluido', task.concluido);
      expect(taskUpdated).to.have.property('ativo', task.ativo);
      expect(taskUpdated).to.have.property('excluido', task.excluido);
    });

    it('Updates task ativo field', async () => {
      const ativo = true;
      const { payload } = await app.inject({
        method, url,
        payload: {
          ...TAREFA,
          idusuario: task.idusuario,
          ativo
        }
      });
      const res = JSON.parse(payload);
      const [taskUpdated] = await taskController.read({ id: task.id });

      expect(res).to.be.an('array').with.lengthOf(1);
      expect(res).to.have.nested.property('0', 1);
      expect(taskUpdated).to.be.not.undefined;
      expect(taskUpdated).to.be.not.null;
      expect(taskUpdated).to.be.an('object');
      expect(taskUpdated).to.have.property('id', task.id);
      expect(taskUpdated).to.have.property('idusuario', task.idusuario);
      expect(taskUpdated).to.have.property('titulo', task.titulo);
      expect(taskUpdated).to.have.property('descricao', task.descricao);
      expect(taskUpdated).to.have.property('concluido', task.concluido);
      expect(taskUpdated).to.have.property('ativo', ativo);
      expect(taskUpdated).to.have.property('excluido', task.excluido);
    });

    it('Updates task concluido field', async () => {
      const concluido = true;
      const { payload } = await app.inject({
        method, url,
        payload: {
          ...TAREFA,
          idusuario: task.idusuario,
          concluido
        }
      });
      const res = JSON.parse(payload);
      const [taskUpdated] = await taskController.read({ id: task.id });

      expect(res).to.be.an('array').with.lengthOf(1);
      expect(res).to.have.nested.property('0', 1);
      expect(taskUpdated).to.be.not.undefined;
      expect(taskUpdated).to.be.not.null;
      expect(taskUpdated).to.be.an('object');
      expect(taskUpdated).to.have.property('id', task.id);
      expect(taskUpdated).to.have.property('idusuario', task.idusuario);
      expect(taskUpdated).to.have.property('titulo', task.titulo);
      expect(taskUpdated).to.have.property('descricao', task.descricao);
      expect(taskUpdated).to.have.property('concluido', concluido);
      expect(taskUpdated).to.have.property('ativo', task.ativo);
      expect(taskUpdated).to.have.property('excluido', task.excluido);
    });

    it('Updates task excluido field', async () => {
      const excluido = true;
      const { payload } = await app.inject({
        method, url,
        payload: {
          ...TAREFA,
          idusuario: task.idusuario,
          excluido
        }
      });
      const res = JSON.parse(payload);
      const [taskUpdated] = await taskController.read({ id: task.id });

      expect(res).to.be.an('array').with.lengthOf(1);
      expect(res).to.have.nested.property('0', 1);
      expect(taskUpdated).to.be.not.undefined;
      expect(taskUpdated).to.be.not.null;
      expect(taskUpdated).to.be.an('object');
      expect(taskUpdated).to.have.property('id', task.id);
      expect(taskUpdated).to.have.property('idusuario', task.idusuario);
      expect(taskUpdated).to.have.property('titulo', task.titulo);
      expect(taskUpdated).to.have.property('descricao', task.descricao);
      expect(taskUpdated).to.have.property('concluido', task.concluido);
      expect(taskUpdated).to.have.property('ativo', task.ativo);
      expect(taskUpdated).to.have.property('excluido', excluido);
    });
  });

  describe('Delete task', function() {
    let usr = {};
    let task = {};

    this.beforeAll(async () => {
      usr = await userController.register(USUARIO);
      task = await taskController.create({...TAREFA, idusuario: usr.id});
    });

    this.afterAll(async () => {
      await userController.delete(usr.id);
    });

    it('Deletes a task', async () => {
      const { payload } = await app.inject({
        method: 'DELETE',
        url: `/task/${task.id}`
      });

      const res = JSON.parse(payload);

      expect(res).to.be.an('number').equal(1);
    });
  });
});
