const { expect } = require('chai');
const ItemModel = require('../src/model/item.model');
const UsuarioModel = require('../src/model/usuario.model');
const TarefaModel = require('../src/model/tarefa.model');
const Context = require('../src/database/base/context');
const Controller = require('../src/controller/task.controller');
const { USUARIO, TAREFA, ITEM } = require('./helper/dataMock.json')

require('./helper/before')();

describe('Task Controller suite', function() {
  this.timeout(Infinity);
  this.slow(500);
  let database = {};
  let controller = {};
  let usuarioSchema = {};
  let tarefaSchema = {};
  let itemSchema = {};
  let objectsToDelete = [];

  const createUsuario = async usuario => {
    database.Schema = usuarioSchema;
    const { id } = await database.create(usuario);
    return id;
  }

  const createTarefa = async tarefa => {
    database.Schema = tarefaSchema;
    const { id } = await database.create(tarefa);
    return id;
  }

  const addToExclude = o => {
    const props = Object.getOwnPropertyNames(o);
    const schema = props.includes('idusuario')
      ? tarefaSchema
      : props.includes('idtarefa') ? itemSchema : usuarioSchema;
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
    controller = new Controller(Context.createContext(process.env.DATABASE));

    usuarioSchema = await database.defineModel(UsuarioModel.getSchema(database.name));
    tarefaSchema = await database.defineModel(TarefaModel.getSchema(database.name));
    itemSchema = await database.defineModel(ItemModel.getSchema(database.name));
  });

  this.afterAll(async () => { await deleteItemsCreated(); });

  describe('Create', function () {
    let idusuario;

    this.beforeAll(async () => {
      idusuario = await createUsuario(USUARIO);

      addToExclude({id: idusuario});
    });

    it('Creates one task', async () => {
      const task = {...TAREFA, idusuario: idusuario};
      const {id} = await controller.create(task);
      
      expect({...task, id}).to.not.undefined;
      expect({...task, id}).to.not.null;
      expect(id).to.not.undefined;
      expect(id).to.not.NaN;
      expect(id).to.be.a('number');

      addToExclude({...task, id});
    });
  });

  describe('Read', function () {
    let idusuario;
    let idtarefa;

    this.beforeAll(async () => {
      idusuario = await createUsuario(USUARIO);
      idtarefa = await createTarefa({...TAREFA, idusuario })

      addToExclude({id: idusuario});
      addToExclude({ idusuario, id: idtarefa });
    });

    it('Reads a task from user id', async () => {
      const [res] = await controller.readByUserId(idusuario);

      expect(res).to.not.null;
      expect(res).to.not.undefined;
      expect(res).to.have.property('idusuario', idusuario);
    });
  });

  describe('Update', function () {
    let tarefa;

    this.beforeAll(async () => {
      const idusuario = await createUsuario(USUARIO);
      const idtarefa = await createTarefa({...TAREFA, idusuario});

      database.Schema = tarefaSchema;
      tarefa = (await database.read({ id: idtarefa }))[0];

      addToExclude({id: idusuario});
      addToExclude({idusuario, id: idtarefa});
    });

    it('Updates task title', async () => {
      const TITLE = 'Updated title';

      const count = await controller.update(tarefa.id, {...tarefa, titulo: TITLE});

      database.Schema = tarefaSchema;
      const [taskUpdated] = await database.read({ id: tarefa.id });

      expect(count).to.be.a('array').to.have.property('length').greaterThan(0);
      expect(count).to.include(1);
      expect(taskUpdated).to.not.null;
      expect(taskUpdated).to.not.undefined;
      expect(taskUpdated).to.have.property('id', tarefa.id);
      expect(taskUpdated).to.have.property('titulo', TITLE);
      expect(taskUpdated).to.not.have.property('dataatualizacao', tarefa.dataatualizacao);
    });

    it('Updates task description', async () => {
      const DESCRIPTION = 'Updated description';

      const count = await controller.update(tarefa.id, {...tarefa, descricao: DESCRIPTION});

      database.Schema = tarefaSchema;
      const [taskUpdated] = await database.read({ id: tarefa.id });

      expect(count).to.be.a('array').to.have.length.greaterThan(0);
      expect(count).to.include(1);
      expect(taskUpdated).to.not.null;
      expect(taskUpdated).to.not.undefined;
      expect(taskUpdated).to.have.property('id', tarefa.id);
      expect(taskUpdated).to.have.property('descricao', DESCRIPTION);
      expect(taskUpdated).to.not.have.property('dataatualizacao', tarefa.dataatualizacao);
    });

    it('Updates task conclusion ', async () => {
      const count = await controller.update(tarefa.id, {...tarefa, concluido: true});

      database.Schema = tarefaSchema;
      const [taskUpdated] = await database.read({ id: tarefa.id });

      expect(count).to.be.a('array').to.have.length.greaterThan(0);
      expect(count).to.include(1);
      expect(taskUpdated).to.not.null;
      expect(taskUpdated).to.not.undefined;
      expect(taskUpdated).to.have.property('id', tarefa.id);
      expect(taskUpdated).to.have.property('concluido').that.is.true;
      expect(taskUpdated).to.not.have.property('dataatualizacao', tarefa.dataatualizacao);});
  });

  describe('Delete', function(){
    let idtarefa;

    this.beforeAll(async () => {
      const idusuario = await createUsuario(USUARIO);
      idtarefa = await createTarefa({...TAREFA, idusuario });

      addToExclude({ id: idusuario });
    });

    it('Deletes one task', async () => {
      const res = !!(await controller.delete(idtarefa));

      database.Schema = tarefaSchema;
      const isDeleted = !(await database.read(idtarefa)).length;

      expect(res).to.be.true;
      expect(isDeleted).to.be.true;
    });
  });
});
