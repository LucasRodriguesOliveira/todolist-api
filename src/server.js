// * Configure Environment
const { configEnviroment } = require('./helper/config');
configEnviroment(process.env.NODE_ENV);

// * Server Imports
const Hapi = require('@hapi/hapi');
const Router = require('./routes/router');
const Context = require('./database/base/context');
const { configRegister, configAuthStrategy } = require('./helper/config');

let database;
try {
  database = Context.createContext(process.env.DATABASE);
  // let res = await database.create({
  //   nome: 'Teste',
  //   email: 'teste@teste.com',
  //   senha: '123'
  // });
} catch(err) {
  console.log(err);
}

// * Setting up the server
const app = new Hapi.server({
  port: process.env.PORT
});

async function main() {
  await app.register(configRegister());

  app.auth.strategy(...configAuthStrategy(process.env.SECRET));

  app.route(Router.getRoutes(
    Router.getDirectories(),
    process.env.SECRET,
    database
  ));

  // * Initialize
  try {
    await app.start();

    console.log('Server running on port: ', app.info.port);
    return app;
  } catch(err) {
    console.log(`An unexpected error has ocurred! ${err}`);
    return;
  }
}

module.exports = main();