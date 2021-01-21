const { expect } = require('chai');
const ItemModel = require('../src/model/item.model');
const UsuarioModel = require('../src/model/usuario.model');
const TarefaModel = require('../src/model/tarefa.model');
const Context = require('../src/database/base/context');
const Controller = require('../src/controller/task.controller');

// * Configure Environment
if(!globalThis.envSetup){
  const { configEnviroment } = require('../src/helper/config');
  configEnviroment(process.env.NODE_ENV);
  globalThis.envSetup = true;
}

describe('Task Controller suite', function() {
  this.timeout(Infinity);
  this.slow(500);
  let database = {};
  let controller = {};
  let usuarioSchema = {};
  let tarefaSchema = {};
  let itemSchema = {};
  let objectsToDelete = [];
  const USUARIO_MOCK = {
    nome: 'Test',
    email: 'test@test.com',
    senha: '123'
  };
  const TAREFA_MOCK = {
    idUsuario: 0,
    titulo: 'Tarefa Teste',
    descricao: 'Descricao de teste'
  };

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
    controller = new Controller(Context.createContext(process.env.DATABASE));

    usuarioSchema = await database.defineModel(UsuarioModel.getSchema(database.name));
    tarefaSchema = await database.defineModel(TarefaModel.getSchema(database.name));
    itemSchema = await database.defineModel(ItemModel.getSchema(database.name));
  });

  this.afterAll(async () => { await deleteItemsCreated(); });

  describe('Create', function () {
    let idUser;

    this.beforeAll(async () => {
      idUser = await createUsuario(USUARIO_MOCK);

      addToExclude({id: idUser});
    });

    it('Creates one task', async () => {
      const task = {...TAREFA_MOCK, idUsuario: idUser};
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
    let idUsuario;
    let idTarefa;

    this.beforeAll(async () => {
      idUsuario = await createUsuario(USUARIO_MOCK);
      idTarefa = await createTarefa({...TAREFA_MOCK, idUsuario })

      addToExclude({id: idUsuario});
      addToExclude({ idUsuario, id: idTarefa });
    });

    it('Reads a task from user id', async () => {
      const [res] = await controller.readByUserId(idUsuario);

      expect(res).to.not.null;
      expect(res).to.not.undefined;
      expect(res).to.have.property('idusuario', idUsuario);
    });
  });

  describe('Update', function () {
    let tarefa;

    this.beforeAll(async () => {
      const idUsuario = await createUsuario(USUARIO_MOCK);
      const idTarefa = await createTarefa({...TAREFA_MOCK, idUsuario});

      database.Schema = tarefaSchema;
      tarefa = (await database.read({ id: idTarefa }))[0];

      addToExclude({id: idUsuario});
      addToExclude({idUsuario, id: idTarefa});
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

      expect(count).to.be.a('array').to.have.property('length').greaterThan(0);
      expect(count).to.include(1);
      expect(taskUpdated).to.not.null;
      expect(taskUpdated).to.not.undefined;
      expect(taskUpdated).to.have.property('id', tarefa.id);
      expect(taskUpdated).to.have.property('descricao', DESCRIPTION);
      expect(taskUpdated).to.not.have.property('dataatualizacao', tarefa.dataatualizacao);
    });

    it('Updates task conclusion ', async () => {
      const DONE = 1;

      const count = await controller.update(tarefa.id, {...tarefa, concluido: DONE});

      database.Schema = tarefaSchema;
      const [taskUpdated] = await database.read({ id: tarefa.id });

      expect(count).to.be.a('array').to.have.property('length').greaterThan(0);
      expect(count).to.include(1);
      expect(taskUpdated).to.not.null;
      expect(taskUpdated).to.not.undefined;
      expect(taskUpdated).to.have.property('id', tarefa.id);
      expect(taskUpdated).to.have.property('concluido', DONE);
      expect(taskUpdated).to.not.have.property('dataatualizacao', tarefa.dataatualizacao);});
  });

  describe('Delete', function(){
    let idTarefa;

    this.beforeAll(async () => {
      const idUsuario = await createUsuario(USUARIO_MOCK);
      idTarefa = await createTarefa({...TAREFA_MOCK, idUsuario });

      addToExclude({ id: idUsuario });
    });

    it('Deletes one task', async () => {
      const res = !!(await controller.delete(idTarefa));

      database.Schema = tarefaSchema;
      const isDeleted = !(await database.read(idTarefa)).length;

      expect(res).to.be.true;
      expect(isDeleted).to.be.true;
    });
  });
});
