const NotImplementedException = require('../exception/notImplemented.exception');

class ICrud {
  create() {
    throw new NotImplementedException('function create');
  }

  read() {
    throw new NotImplementedException('function read');
  }

  update() {
    throw new NotImplementedException('function update');
  }

  delete() {
    throw new NotImplementedException('function delete');
  }
}

module.exports = ICrud;
