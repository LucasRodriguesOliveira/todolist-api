const { expect } = require('chai');
const ItemModel = require('../src/model/item.model');
const UsuarioModel = require('../src/model/usuario.model');
const TarefaModel = require('../src/model/tarefa.model');
const Context = require('../src/database/base/context');
const Controller = require('../src/controller/item.controller');

// * Configure Environment
if(!globalThis.envSetup){
  const { configEnviroment } = require('../src/helper/config');
  configEnviroment(process.env.NODE_ENV);
  globalThis.envSetup = true;
}

describe('Item Controller Suite', function () {
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
  const ITEM_MOCK = {
    idTarefa: 0,
    descricao: 'Atividade de teste'
  }

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

  const createItem = async item => {
    database.Schema = itemSchema;
    const { id } = await database.create(item);
    return id;
  }

  const createManyTaskItems = async (n, m) =>
    Promise.all(
      Array(n)
        .fill(null)
        .map(async _ => await createItem(m))
    ).then(vals => {
      vals.forEach(async id => objectsToDelete.push({ schema: itemSchema, id}))
    });

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
    let idTarefa;

    this.beforeAll(async () => {
      const idUsuario = await createUsuario(USUARIO_MOCK);
      const tarefa = {...TAREFA_MOCK, idUsuario};   
      idTarefa = await createTarefa(tarefa);

      addToExclude({...USUARIO_MOCK, id: idUsuario});
      addToExclude({...tarefa, id: idTarefa});
    });

    it('Creates one item', async () => {
      const item = {...ITEM_MOCK, idTarefa};
      const {id} = await controller.create(item);
      
      expect({...item, id}).to.not.undefined;
      expect({...item, id}).to.not.null;
      expect(id).to.not.undefined;
      expect(id).to.not.NaN;
      expect(id).to.be.a('number');

      addToExclude({...item, id});
    });
  });

  describe('Read', function() {
    let idTarefa;
    const COUNT_TASK_ITEMS = 2;

    this.beforeAll(async () => {
      const idUsuario = await createUsuario(USUARIO_MOCK);
      const tarefa = {...TAREFA_MOCK, idUsuario};
      idTarefa = await createTarefa(tarefa);
      const item = {...ITEM_MOCK, idTarefa};
      
      addToExclude({...USUARIO_MOCK, id: idUsuario});
      addToExclude({...tarefa, id: idTarefa});

      await createManyTaskItems(COUNT_TASK_ITEMS, item);
    });

    it('Reads all items by task id', async () => {
      const res = await controller.readByTaskId(idTarefa);

      expect(res).to.be.an('Array');
      expect(res).to.have.lengthOf(COUNT_TASK_ITEMS);
    });
  });

  describe('Update', function() {
    let item;

    this.beforeAll(async () => {
      const idUsuario = await createUsuario(USUARIO_MOCK);
      const idTarefa = await createTarefa({...TAREFA_MOCK, idUsuario});
      const idItem = await createItem({...ITEM_MOCK, idTarefa});

      database.Schema = itemSchema;
      item = (await database.read({ id: idItem }))[0];
      
      addToExclude({ id: idUsuario });
      addToExclude({ idUsuario, id: idTarefa });
      addToExclude({ idTarefa, id: idItem });
    });

    it('Updates a task item description', async () => {
      const DESCRIPTION = 'DESCRIÇÃO ATUALIZADA';

      await controller.update(item.id, {...item, descricao: DESCRIPTION});

      database.Schema = itemSchema;
      const [itemUpdated] = await database.read({ id: item.id });

      expect(itemUpdated).to.not.null;
      expect(itemUpdated).to.have.property('id', item.id);
      expect(itemUpdated).to.have.property('descricao', DESCRIPTION);
      expect(itemUpdated).to.not.have.property('dataatualizacao', item.dataatualizacao);
    });
    it('Updates a task conclusion', async () => {
      const DONE = 1;

      await controller.update(item.id, {...item, concluido: DONE});

      database.Schema = itemSchema;
      const [itemUpdated] = await database.read({ id: item.id });

      expect(itemUpdated).to.not.null;
      expect(itemUpdated).to.have.property('id', item.id);
      expect(itemUpdated).to.have.property('concluido', DONE);
      expect(itemUpdated).to.not.have.property('dataatualizacao', item.dataatualizacao);
    });
  });

  describe('Delete', function () {
    let item;

    this.beforeAll(async () => {
      const idUsuario = await createUsuario(USUARIO_MOCK);
      const idTarefa = await createTarefa({...TAREFA_MOCK, idUsuario});
      const idItem = await createItem({...ITEM_MOCK, idTarefa});

      database.Schema = itemSchema;
      item = (await database.read({ id: idItem }))[0];
      
      addToExclude({ id: idUsuario });
      addToExclude({ idUsuario, id: idTarefa });
    });''

    it('Deletes a item by updating field "excluido"', async () => {
      const DELETED = 1;

      await controller.update(item.id, { ...item, excluido: DELETED });

      database.Schema = itemSchema;
      const [itemDeleted] = await database.read({ id: item.id });

      expect(itemDeleted).to.not.null;
      expect(itemDeleted).to.have.property('id', item.id);
      expect(itemDeleted).to.have.property('excluido', DELETED);
      expect(itemDeleted).to.not.have.property('dataatualizacao', item.dataatualizacao);
    });

    it('Deletes a item', async () => {
      const res = await controller.delete(item.id);
      
      database.Schema = itemSchema;
      const isItemDeleted = !(await database.read({ id: item.id })).length;

      expect(res).to.be.greaterThan(0);
      expect(isItemDeleted).to.be.true;
    }); 
  });
});
