const { expect } = require('chai');
const Postgres = require('../src/database/postgres/postgres.database');
const UsuarioModel = require('../src/model/usuario.model');
const TarefaModel = require('../src/model/tarefa.model');
const ItemModel = require('../src/model/item.model');

// * Configure Environment
const { configEnviroment } = require('../src/helper/config');
configEnviroment(process.env.NODE_ENV);

describe('Postgres Strategy Suite', function() {
  this.timeout(Infinity);
  this.slow(500);
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

    usuarioSchema.hasMany(tarefaSchema, { foreignKey: 'idUsuario' });
    tarefaSchema.belongsTo(usuarioSchema, { foreignKey: 'idUsuario' });
    tarefaSchema.hasMany(itemSchema, { foreignKey: 'idTarefa' });
    itemSchema.belongsTo(tarefaSchema, { foreignKey: 'idTarefa' });
  });

  describe('Connection', () => {
    it('Checks database connection', async () => {
      let isConnected = await database.isConnected();
      expect(isConnected).to.be.true;
    });
  });

  describe('Create', function() {
    const USUARIO_MOCK = {
      nome: 'Test',
      email: 'test@test.com',
      senha: '123'
    };

    const USUARIO_MOCK_TAREFA = { ...USUARIO_MOCK };
    const USUARIO_MOCK_ITEM = { ...USUARIO_MOCK };

    const TAREFA_MOCK = {
      idUsuario: 0,
      titulo: 'Tarefa Teste',
      descricao: 'Descricao de teste'
    };

    const TAREFA_MOCK_ITEM = { ...TAREFA_MOCK };

    const ITEM_MOCK = {
      idTarefa: 0,
      descricao: 'Atividade de teste'
    }

    this.afterAll(async () => { await deleteItemsCreated(); });

    it('Creates a user successfully', async () => {
      database.Schema = usuarioSchema;
      const { id } = await database.create(USUARIO_MOCK);
      objectsToDelete.push({ schema: usuarioSchema, id });

      USUARIO_MOCK.id = id

      expect(USUARIO_MOCK.id).to.not.undefined;
      expect(USUARIO_MOCK.id).to.not.null;
      expect(USUARIO_MOCK.id).to.be.a('number');
    });

    it('Creates a task successfully', async () => {
      USUARIO_MOCK_TAREFA.id = await createUsuario(USUARIO_MOCK_TAREFA);
      objectsToDelete.push({ schema: usuarioSchema, id: USUARIO_MOCK_TAREFA.id });
      TAREFA_MOCK.idUsuario = USUARIO_MOCK_TAREFA.id;

      database.Schema = tarefaSchema;
      const { id } = await database.create(TAREFA_MOCK);
      TAREFA_MOCK.id = id;
      objectsToDelete.push({ schema: tarefaSchema, id });

      expect(TAREFA_MOCK.id).to.not.undefined;
      expect(TAREFA_MOCK.id).to.not.null;
      expect(TAREFA_MOCK.id).to.be.a('number');
    });

    it('Creates a task item successfully', async () => {
      USUARIO_MOCK_ITEM.id = await createUsuario(USUARIO_MOCK_ITEM);
      objectsToDelete.push({ schema: usuarioSchema, id: USUARIO_MOCK_ITEM.id });
      TAREFA_MOCK_ITEM.idUsuario = USUARIO_MOCK_ITEM.id;
      TAREFA_MOCK_ITEM.id = await createTarefa(TAREFA_MOCK_ITEM);
      objectsToDelete.push({ schema: tarefaSchema, id: TAREFA_MOCK_ITEM.id });
      ITEM_MOCK.idTarefa = TAREFA_MOCK_ITEM.id;

      database.Schema = itemSchema;
      const { id } = await database.create(ITEM_MOCK);
      ITEM_MOCK.id = id;
      objectsToDelete.push({ schema: itemSchema, id });

      expect(ITEM_MOCK.id).to.not.undefined;
      expect(ITEM_MOCK.id).to.not.null;
      expect(ITEM_MOCK.id).to.be.a('number');
    });
  });

  describe('Read', function() {
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

    this.afterAll(async () => { await deleteItemsCreated(); });

    describe('Read One', () => {
      it('Reads one user', async () => {
        await createManyUsers(2, USUARIO_MOCK);
        
        database.Schema = usuarioSchema;
        let users = await database.read({ id: objectsToDelete[0].id });
        
        expect(users).to.be.an('array').that.is.not.empty;
        expect(users).to.have.length(1);
        expect(users[0]).to.have.property('id');
      });

      it('Reads one task', async () => {
        await createManyUsers(1, USUARIO_MOCK);
        TAREFA_MOCK.idUsuario = objectsToDelete[objectsToDelete.length - 1].id;
        await createManyTasks(2, TAREFA_MOCK);

        database.Schema = tarefaSchema;
        let tasks = await database.read({ id: objectsToDelete.find(o => o.schema === tarefaSchema).id });

        expect(tasks).to.be.an('array').that.is.not.empty;
        expect(tasks).to.have.length(1);
        expect(tasks[0]).to.have.property('id');
      });

      it('Reads one item', async () => {
        await createManyUsers(1, USUARIO_MOCK);
        TAREFA_MOCK.idUsuario = objectsToDelete.find(o => o.schema === usuarioSchema).id
        await createManyTasks(1, TAREFA_MOCK);
        ITEM_MOCK.idTarefa = objectsToDelete.find(o => o.schema === tarefaSchema).id
        await createManyTaskItems(2, ITEM_MOCK);

        database.Schema = itemSchema;
        let items = await database.read({ id: objectsToDelete.find(o => o.schema === itemSchema).id });

        expect(items).to.be.an('array').that.is.not.empty;
        expect(items).to.have.length(1);
        expect(items[0]).to.have.property('id');
      });
    });

    describe('Read All', function() {
      const USERS_COUNT = 5;
      const TASKS_COUNT = 5;
      const TASK_ITEMS_COUNT = 5;

      this.beforeAll(async () => {
        await createManyUsers(USERS_COUNT, USUARIO_MOCK);
        TAREFA_MOCK.idUsuario = objectsToDelete[objectsToDelete.length - 1].id;
        await createManyTasks(TASKS_COUNT, TAREFA_MOCK);
        ITEM_MOCK.idTarefa = objectsToDelete[objectsToDelete.length - 1].id;
        await createManyTaskItems(TASK_ITEMS_COUNT, ITEM_MOCK);
      });

      it('Read all users', async () => {
        database.Schema = usuarioSchema;
        const users = await database.read();

        expect(users).to.be.an('array').that.is.not.empty;
        expect(users).to.have.length.gte(USERS_COUNT);
        expect(users[0]).to.have.property('id');
      });

      it('Read all tasks', async () => {
        database.Schema = tarefaSchema;
        const tasks = await database.read();

        expect(tasks).to.be.an('array').that.is.not.empty;
        expect(tasks).to.have.length.gte(TASKS_COUNT);
        expect(tasks[0]).to.have.property('id');
      });

      it('Read all tasks from one user', async () => {
        const { dataValues: user } = await usuarioSchema.findOne({
          where: { id: TAREFA_MOCK.idUsuario }, 
          include: tarefaSchema
        });
        const { tarefas } = user;

        expect(tarefas).to.be.an('array').that.is.not.empty;
        expect(tarefas).to.have.length.gte(TASKS_COUNT);
        expect(tarefas[0]).to.have.property('id');
      });

      it("Read all task item's from one task", async () => {
        const { dataValues: { items } } = await tarefaSchema.findOne({
          where: { id: ITEM_MOCK.idTarefa },
          include: itemSchema
        });

        expect(items).to.be.an('array').that.is.not.empty;
        expect(items).to.have.length.gte(TASKS_COUNT);
        expect(items[0]).to.have.property('id');
      });
    });
  });

  describe('Update', function() {
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

    this.afterAll(async () => { await deleteItemsCreated(); });

    describe('Update User', () => {
      const NEW_PSWD = '123456';
      const NEW_NAME = 'User test';
      const NEW_EMAIL = 'test@test.test';
      let usr;

      this.beforeAll(async () => {
        const id = await createUsuario(USUARIO_MOCK);
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
      const NEW_DONE = 1; // por questão de compatibilidade, é utilizado 1 ao invés de true
      let tsk;

      this.beforeAll(async () => {
        const idUsuario = await createUsuario(USUARIO_MOCK);
        objectsToDelete.push({ schema: usuarioSchema, id: idUsuario });
        const id = await createTarefa({...TAREFA_MOCK, idUsuario});
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
      const NEW_DONE = 1; // por questão de compatibilidade, é utilizado 1 ao invés de true
      let tskItem;

      this.beforeAll(async () => {
        const idUsuario = await createUsuario(USUARIO_MOCK);
        objectsToDelete.push({ schema: usuarioSchema, id: idUsuario });
        const idTarefa = await createTarefa({...TAREFA_MOCK, idUsuario});
        objectsToDelete.push({ schema: tarefaSchema, id: idTarefa });
        const id = await createItem({...ITEM_MOCK, idTarefa});
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

    this.afterAll(async () => { await deleteItemsCreated(); });

    describe('Delete User', function () {
      let id;
      this.beforeAll(async () => {
        id = await createUsuario(USUARIO_MOCK);
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
        const idUsuario = await createUsuario(USUARIO_MOCK);
        objectsToDelete.push({schema: usuarioSchema, id: idUsuario});
        id = await createTarefa({...TAREFA_MOCK, idUsuario});
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
        const idUsuario = await createUsuario(USUARIO_MOCK);
        objectsToDelete.push({schema: usuarioSchema, id: idUsuario});
        const idTarefa = await createTarefa({...TAREFA_MOCK, idUsuario});
        objectsToDelete.push({schema: tarefaSchema, id: idTarefa});
        id = await createItem({...ITEM_MOCK, idTarefa});
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