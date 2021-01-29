const ICrud = require('./ICrud.interface');

class IDatabase extends ICrud {
  constructor(name, connection) {
    super();
    this.name = name;
    this.connection = connection;
  }

  isConnected() {
    throw new NotImplementedException('function isConnected');
  }

  connect() {
    throw new NotImplementedException('function connect');
  }
}

module.exports = IDatabase;
