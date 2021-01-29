process.env.NODE_ENV = 'test';

module.exports = {
  slow: 300,
  timeout: Infinity,
  extension: [ 'js' ],
  spec: './test/*.test.js'
}
