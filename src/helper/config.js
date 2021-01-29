function configEnviroment(env) {
  const enviroments = e => `.env.${e.toLowerCase()}`;

  require('dotenv').config({
    path: enviroments(env)
  });
}

function configSwagger(HapiSwagger) {
  return {
    plugin: HapiSwagger,
    options: {
      info: {
        title: process.env.TITLE,
        version: process.env.npm_package_version
      }
    }
  }
}

function configRegister() {
  const Swagger = configSwagger(require('hapi-swagger'));
  const Vision = require('@hapi/vision');
  const Inert = require('@hapi/inert');
  const HapiJWT = require('hapi-auth-jwt2');

  return [
    Vision,
    Inert,
    Swagger,
    HapiJWT
  ];
}

function configAuthStrategy(jwtTokenSecret) {
  return [
    'jwt',
    'jwt',
    {
      key: jwtTokenSecret,
      validate: () => {
        return { isValid: true }
      }
    }
  ];
}

module.exports = {
  configEnviroment,
  configRegister,
  configAuthStrategy
}
