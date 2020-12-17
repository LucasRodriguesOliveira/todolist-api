const IController = require('../interface/IController.interface');
const { Ok } = require('../helper/util');

class UserController extends IController {
  constructor(db) {
    super(db);
  }
}