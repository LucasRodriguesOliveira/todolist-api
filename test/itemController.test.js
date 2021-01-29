const { expect } = require('chai');
const ItemModel = require('../src/model/item.model');
const UsuarioModel = require('../src/model/usuario.model');
const TarefaModel = require('../src/model/tarefa.model');
const Context = require('../src/database/base/context');
const Controller = require('../src/controller/item.controller');
const { USUARIO, TAREFA, ITEM } = require('./helper/dataMock.json');

require('./helper/before')();

describe('Item Controller suite', function () {
  this.timeout(Infinity);
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
    let idtarefa;

    this.beforeAll(async () => {
      const idusuario = await createUsuario(USUARIO);
      const tarefa = {...TAREFA, idusuario};
      idtarefa = await createTarefa(tarefa);

      addToExclude({...USUARIO, id: idusuario});
      addToExclude({...tarefa, id: idtarefa});
    });

    it('Creates one item', async () => {
      const item = {...ITEM, idtarefa};
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
    let idtarefa;
    const COUNT_TASK_ITEMS = 2;

    this.beforeAll(async () => {
      const idusuario = await createUsuario(USUARIO);
      const tarefa = {...TAREFA, idusuario};
      idtarefa = await createTarefa(tarefa);
      const item = {...ITEM, idtarefa};
      
      addToExclude({...USUARIO, id: idusuario});
      addToExclude({...tarefa, id: idtarefa});

      await createManyTaskItems(COUNT_TASK_ITEMS, item);
    });

    it('Reads all items by task id', async () => {
      const res = await controller.readByTaskId(idtarefa);

      expect(res).to.be.an('Array');
      expect(res).to.have.lengthOf(COUNT_TASK_ITEMS);
    });
  });

  describe('Update', function() {
    let item;

    this.beforeAll(async () => {
      const idusuario = await createUsuario(USUARIO);
      const idtarefa = await createTarefa({...TAREFA, idusuario});
      const iditem = await createItem({...ITEM, idtarefa});

      database.Schema = itemSchema;
      item = (await database.read({ id: iditem }))[0];
      
      addToExclude({ id: idusuario });
      addToExclude({ idusuario, id: idtarefa });
      addToExclude({ idtarefa, id: iditem });
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
      await controller.update(item.id, {...item, concluido: true});

      database.Schema = itemSchema;
      const [itemUpdated] = await database.read({ id: item.id });

      expect(itemUpdated).to.not.null;
      expect(itemUpdated).to.have.property('id', item.id);
      expect(itemUpdated).to.have.property('concluido').that.is.true;
      expect(itemUpdated).to.not.have.property('dataatualizacao', item.dataatualizacao);
    });
  });

  describe('Delete', function () {
    let item;

    this.beforeAll(async () => {
      const idusuario = await createUsuario(USUARIO);
      const idtarefa = await createTarefa({...TAREFA, idusuario});
      const iditem = await createItem({...ITEM, idtarefa});

      database.Schema = itemSchema;
      item = (await database.read({ id: iditem }))[0];
      
      addToExclude({ id: idusuario });
      addToExclude({ idusuario, id: idtarefa });
    });''

    it('Deletes a item by updating field "excluido"', async () => {
      await controller.update(item.id, { ...item, excluido: true });

      database.Schema = itemSchema;
      const [itemDeleted] = await database.read({ id: item.id });

      expect(itemDeleted).to.not.null;
      expect(itemDeleted).to.have.property('id', item.id);
      expect(itemDeleted).to.have.property('excluido').that.is.true;
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
