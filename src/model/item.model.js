const IModel = require('../interface/IModel.interface');
const { context: { databases, dbNotFoundMsg } } = require('../database/base/config.json');

class ItemModel extends IModel {
  static getSchema(databaseName) {
    if(databases.includes(databaseName)) {
      const folder = IModel.DatabaseFolderPath;
      const db = databaseName.toLowerCase();
      const schemaName = ItemModel.Name;
      const path = `${folder}/${db}/schema/${schemaName}.schema.js`;
      return require(path);
    }

    throw new Error(dbNotFoundMsg);
  }
}

module.exports = ItemModel;