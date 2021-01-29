const { expect } = require('chai');
const Postgres = require('../src/database/postgres/postgres.database');
const UsuarioModel = require('../src/model/usuario.model');
const TarefaModel = require('../src/model/tarefa.model');
const ItemModel = require('../src/model/item.model');
const { USUARIO, TAREFA, ITEM } = require('./helper/dataMock.json');

require('./helper/before')();

describe('Postgres Strategy suite', function() {
  let database = {};
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

  const createManyUsers = async (n, m) =>
    Promise.all(
      Array(n)
        .fill(null)
        .map(async x => await createUsuario(m))
    ).then(vals => {
      vals.forEach(async id => objectsToDelete.push({ schema: usuarioSchema, id}))
    });

  const createManyTasks = async (n, m) => 
    Promise.all(
      Array(n)
        .fill(null)
        .map(async x => await createTarefa(m))
    ).then(vals => {
      vals.forEach(async id => objectsToDelete.push({ schema: tarefaSchema, id}))
    });
  
  const createManyTaskItems = async (n, m) =>
    Promise.all(
      Array(n)
        .fill(null)
        .map(async x => await createItem(m))
    ).then(vals => {
      vals.forEach(async id => objectsToDelete.push({ schema: itemSchema, id}))
    });

  const deleteItemsCreated = async () => {
    objectsToDelete.reverse();

    await objectsToDelete.forEach(async obj => {
      database.Schema = obj.schema;
      await database.delete(obj.id);
    });

    objectsToDelete = [];
  }

  this.beforeAll(async () => {
    database = new Postgres(Postgres.connect());

    usuarioSchema = await database.defineModel(UsuarioModel.getSchema(database.name));
    tarefaSchema = await database.defineModel(TarefaModel.getSchema(database.name));
    itemSchema = await database.defineModel(ItemModel.getSchema(database.name));

    usuarioSchema.hasMany(tarefaSchema, { foreignKey: 'idusuario' });
    tarefaSchema.belongsTo(usuarioSchema, { foreignKey: 'idusuario' });
    tarefaSchema.hasMany(itemSchema, { foreignKey: 'idtarefa' });
    itemSchema.belongsTo(tarefaSchema, { foreignKey: 'idtarefa' });
  });

  this.afterAll(async () => {
    await database.close();
  });

  describe('Connection', () => {
    it('Checks database connection', async () => {
      let isConnected = await database.isConnected();
      expect(isConnected).to.be.true;
    });
  });

  describe('Create', function() {
    this.afterAll(async () => { await deleteItemsCreated(); });

    it('Creates a user successfully', async () => {
      database.Schema = usuarioSchema;
      const { id } = await database.create(USUARIO);
      objectsToDelete.push({ schema: usuarioSchema, id });

      expect(id).to.not.undefined;
      expect(id).to.not.null;
      expect(id).to.be.a('number');
    });

    it('Creates a task successfully', async () => {
      idusuario = await createUsuario(USUARIO);
      objectsToDelete.push({ schema: usuarioSchema, id: idusuario });

      database.Schema = tarefaSchema;
      const { id } = await database.create({...TAREFA, idusuario});
      objectsToDelete.push({ schema: tarefaSchema, id });

      expect(id).to.not.undefined;
      expect(id).to.not.null;
      expect(id).to.be.a('number');
    });

    it('Creates a task item successfully', async () => {
      idusuario = await createUsuario(USUARIO);
      objectsToDelete.push({ schema: usuarioSchema, id: idusuario });
      idtarefa = await createTarefa({...TAREFA, idusuario});
      objectsToDelete.push({ schema: tarefaSchema, id: idtarefa });

      database.Schema = itemSchema;
      const { id } = await database.create({...ITEM, idtarefa});
      objectsToDelete.push({ schema: itemSchema, id });

      expect(id).to.not.undefined;
      expect(id).to.not.null;
      expect(id).to.be.a('number');
    });
  });

  describe('Read', function() {
    this.afterAll(async () => { await deleteItemsCreated(); });

    describe('Read One', () => {
      it('Reads one user', async () => {
        await createManyUsers(2, USUARIO);
        
        database.Schema = usuarioSchema;
        let users = await database.read({ id: objectsToDelete[0].id });
        
        expect(users).to.be.an('array').that.is.not.empty;
        expect(users).to.have.length(1);
        expect(users).to.have.nested.property('0.id', objectsToDelete[0].id);
      });

      it('Reads one task', async () => {
        await createManyUsers(1, USUARIO);
        const idusuario = objectsToDelete[objectsToDelete.length - 1].id;
        await createManyTasks(2, {...TAREFA, idusuario});

        database.Schema = tarefaSchema;
        let tasks = await database.read({ id: objectsToDelete.find(o => o.schema === tarefaSchema).id });

        expect(tasks).to.be.an('array').that.is.not.empty;
        expect(tasks).to.have.length(1);
        expect(tasks).to.have.nested.property('[0].id');
      });

      it('Reads one item', async () => {
        await createManyUsers(1, USUARIO);
        const idusuario = objectsToDelete.find(o => o.schema === usuarioSchema).id
        await createManyTasks(1, { ...TAREFA, idusuario });
        const idtarefa = objectsToDelete.find(o => o.schema === tarefaSchema).id
        await createManyTaskItems(2, {...ITEM, idtarefa});

        database.Schema = itemSchema;
        let items = await database.read({ id: objectsToDelete.find(o => o.schema === itemSchema).id });

        expect(items).to.be.an('array').that.is.not.empty;
        expect(items).to.have.length(1);
        expect(items).to.have.nested.property('0.id');
      });
    });

    describe('Read All', function() {
      const USERS_COUNT = 5;
      const TASKS_COUNT = 5;
      const TASK_ITEMS_COUNT = 5;

      let idusuario;
      let idtarefa;

      this.beforeAll(async () => {
        await createManyUsers(USERS_COUNT, USUARIO);
        idusuario = objectsToDelete[objectsToDelete.length - 1].id;
        await createManyTasks(TASKS_COUNT, {...TAREFA, idusuario});
        idtarefa = objectsToDelete[objectsToDelete.length - 1].id;
        await createManyTaskItems(TASK_ITEMS_COUNT, {...ITEM, idtarefa});
      });

      it('Read all users', async () => {
        database.Schema = usuarioSchema;
        const users = await database.read();

        expect(users).to.be.an('array').that.is.not.empty;
        expect(users).to.have.length.gte(USERS_COUNT);
        expect(users).to.have.nested.property('0.id');
      });

      it('Read all tasks', async () => {
        database.Schema = tarefaSchema;
        const tasks = await database.read();

        expect(tasks).to.be.an('array').that.is.not.empty;
        expect(tasks).to.have.length.gte(TASKS_COUNT);
        expect(tasks).to.have.nested.property('0.id');
      });

      it('Read all tasks from one user', async () => {
        const { dataValues: user } = await usuarioSchema.findOne({
          where: { id: idusuario },
          include: tarefaSchema
        });
        const { tarefas } = user;

        expect(tarefas).to.be.an('array').that.is.not.empty;
        expect(tarefas).to.have.length.gte(TASKS_COUNT);
        expect(tarefas).to.have.nested.property('0.id');
      });

      it("Read all task item's from one task", async () => {
        const { dataValues: { items } } = await tarefaSchema.findOne({
          where: { id: idtarefa },
          include: itemSchema
        });

        expect(items).to.be.an('array').that.is.not.empty;
        expect(items).to.have.length.gte(TASKS_COUNT);
        expect(items).to.have.nested.property('0.id');
      });
    });
  });

  describe('Update', function() {
    this.afterAll(async () => { await deleteItemsCreated(); });

    describe('Update User', () => {
      const NEW_PSWD = '123456';
      const NEW_NAME = 'User test';
      const NEW_EMAIL = 'test@test.test';
      let usr;

      this.beforeAll(async () => {
        const id = await createUsuario(USUARIO);
        database.Schema = usuarioSchema;
        objectsToDelete.push({ schema: database.Schema, id });
        usr = (await database.read({ id }))[0];
      });

      it('Update User password', async () => {
        database.Schema = usuarioSchema;
        await database.update(usr.id, {...usr, senha: NEW_PSWD});
        const [res] = await database.read({ id: usr.id });
        
        expect(res).to.not.null;
        expect(res).to.have.property('senha', NEW_PSWD);
        expect(res).to.not.have.property('dataatualizacao', usr.dataatualizacao);
      });

      it('Update User name', async () => {
        database.Schema = usuarioSchema;
        await database.update(usr.id, {...usr, nome: NEW_NAME});
        const [res] = await database.read({ id: usr.id });
        
        expect(res).to.not.null;
        expect(res).to.have.property('nome', NEW_NAME);
        expect(res).to.not.have.property('dataatualizacao', usr.dataatualizacao);
      });

      it('Update User email', async () => {
        database.Schema = usuarioSchema;
        await database.update(usr.id, {...usr, email: NEW_EMAIL});
        const [res] = await database.read({ id: usr.id });
        
        expect(res).to.not.null;
        expect(res).to.have.property('email', NEW_EMAIL);
        expect(res).to.not.have.property('dataatualizacao', usr.dataatualizacao);
      });
    });

    describe('Update Task', () => {
      const NEW_TITLE = 'UPDATE TASK NAME';
      const NEW_DESCRIPTION = 'UPDATE TASK DESCRIPTION';
      const NEW_DONE = true;
      let tsk;

      this.beforeAll(async () => {
        const idusuario = await createUsuario(USUARIO);
        objectsToDelete.push({ schema: usuarioSchema, id: idusuario });
        const id = await createTarefa({...TAREFA, idusuario});
        database.Schema = tarefaSchema;
        objectsToDelete.push({ schema: database.Schema, id });
        tsk = (await database.read({ id }))[0];
      });

      it('Update Task title', async () => {
        database.Schema = tarefaSchema;
        await database.update(tsk.id, {...tsk, titulo: NEW_TITLE});
        const [res] = await database.read({id: tsk.id});

        expect(res).to.not.null;
        expect(res).to.have.property('titulo', NEW_TITLE);
        expect(res).to.not.have.property('dataatualizacao', tsk.dataatualizacao);
      });

      it('Update Task description', async () => {
        database.Schema = tarefaSchema;
        await database.update(tsk.id, {...tsk, descricao: NEW_DESCRIPTION});
        const [res] = await database.read({id: tsk.id});

        expect(res).to.not.null;
        expect(res).to.have.property('descricao', NEW_DESCRIPTION);
        expect(res).to.not.have.property('dataatualizacao', tsk.dataatualizacao);
      });

      it('Update Task done', async () => {
        database.Schema = tarefaSchema;
        await database.update(tsk.id, {...tsk, concluido: NEW_DONE});
        const [res] = await database.read({id: tsk.id});

        expect(res).to.not.null;
        expect(res).to.have.property('concluido', NEW_DONE);
        expect(res).to.not.have.property('dataatualizacao', tsk.dataatualizacao);
      });
    });

    describe('Update Task Item', () => {
      const NEW_DESCRIPTION = 'UPDATE TASK ITEM DESCRIPTION';
      const NEW_DONE = true;
      let tskItem;

      this.beforeAll(async () => {
        const idusuario = await createUsuario(USUARIO);
        objectsToDelete.push({ schema: usuarioSchema, id: idusuario });
        const idtarefa = await createTarefa({...TAREFA, idusuario});
        objectsToDelete.push({ schema: tarefaSchema, id: idtarefa });
        const id = await createItem({...ITEM, idtarefa});
        database.Schema = itemSchema;
        objectsToDelete.push({ schema: database.Schema, id });
        tskItem = (await database.read({ id }))[0];
      });

      it('Update Task Item description', async () => {
        database.Schema = itemSchema;
        await database.update(tskItem.id, {...tskItem, descricao: NEW_DESCRIPTION});
        const [res] = await database.read({id: tskItem.id});

        expect(res).to.not.null;
        expect(res).to.have.property('descricao', NEW_DESCRIPTION);
        expect(res).to.not.have.property('dataatualizacao', tskItem.dataatualizacao);
      });

      it('Update Task Item done', async () => {
        database.Schema = itemSchema;
        await database.update(tskItem.id, {...tskItem, concluido: NEW_DONE});
        const [res] = await database.read({id: tskItem.id});

        expect(res).to.not.null;
        expect(res).to.have.property('concluido', NEW_DONE);
        expect(res).to.not.have.property('dataatualizacao', tskItem.dataatualizacao);
      });
    });
  });

  describe('Delete', function () {
    this.afterAll(async () => { await deleteItemsCreated(); });

    describe('Delete User', function () {
      let id;
      this.beforeAll(async () => {
        id = await createUsuario(USUARIO);
      });

      it('Delete one user', async () => {
        database.Schema = usuarioSchema;
        const res = await database.delete(id);

        expect(res).to.not.undefined;
        expect(res).to.be.greaterThan(0);
        expect(res).to.be.deep.equal(1);
      });
    });

    describe('Delete Task', function () {
      let id;
      this.beforeAll(async () => {
        const idusuario = await createUsuario(USUARIO);
        objectsToDelete.push({schema: usuarioSchema, id: idusuario});
        id = await createTarefa({...TAREFA, idusuario});
      });

      it('Delete one task', async () => {
        database.Schema = tarefaSchema;
        const res = await database.delete(id);

        expect(res).to.not.undefined;
        expect(res).to.be.greaterThan(0);
        expect(res).to.be.deep.equal(1);
      });
    });

    describe('Delete Task Item', function () {
      let id;
      this.beforeAll(async () => {
        const idusuario = await createUsuario(USUARIO);
        objectsToDelete.push({schema: usuarioSchema, id: idusuario});
        const idtarefa = await createTarefa({...TAREFA, idusuario});
        objectsToDelete.push({schema: tarefaSchema, id: idtarefa});
        id = await createItem({...ITEM, idtarefa});
      });

      it('Delete one task item', async () => {
        database.Schema = itemSchema;
        const res = await database.delete(id);

        expect(res).to.not.undefined;
        expect(res).to.be.greaterThan(0);
        expect(res).to.be.deep.equal(1);
      });
    });
  });
});