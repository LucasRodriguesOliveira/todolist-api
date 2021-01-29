class NotInformedParameter extends Error {
  constructor(name) {
    super(`Parameter ${name} is required!`)
  }
}

module.exports = NotInformedParameter;
