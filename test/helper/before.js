module.exports = () => {
  // * Configure Environment
  if(!globalThis.envSetup) {
    require('../../src/helper/config').configEnviroment(process.env.NODE_ENV);
    globalThis.envSetup = true;
  }
}
