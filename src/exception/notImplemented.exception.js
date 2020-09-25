class NotImplementedException extends Error {
  constructor(name) {
    super(`Not Implemented Exception! ${name ? 'Expected ' + name + '!' : ''}`);
  }
}

module.exports = NotImplementedException;