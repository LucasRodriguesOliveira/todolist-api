const Handler = require('./base/FullHandler');

class TaskController extends Handler {
  constructor(db){
    super(db, require('../model/tarefa.model'));
  }

  async readByUserId(idUsuario) {
    await this.before();
    return await this.Database.read({ idUsuario });
  }
}

module.exports = TaskController;
