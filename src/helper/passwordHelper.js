const Bcrypt = require('bcrypt');
const { promisify } = require('util');

const HashAsync = promisify(Bcrypt.hash);
const CompareAsync = promisify(Bcrypt.compare);
const _salt = 5;

class PasswordHelper {
  static HashPassword(password) {
    return HashAsync(password, _salt);
  }

  static ComparePassword(password, hash) {
    return CompareAsync(password, hash);
  }
}

module.exports = PasswordHelper;
