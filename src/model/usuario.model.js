const IModel = require('../interface/IModel.interface');
const { context: { databases, dbNotFoundMsg } } = require('../database/base/config.json');

class UsuarioModel extends IModel {
  

  static getSchema(databaseName) {
    if(databases.includes(databaseName)) {
      const folder = IModel.DatabaseFolderPath;
      const db = databaseName.toLowerCase();
      const schemaName = UsuarioModel.Name;
      const path = `${folder}/${db}/schema/${schemaName}.schema.js`;
      return require(path);
    }

    throw new Error(dbNotFoundMsg);
  }
}

module.exports = UsuarioModel;
