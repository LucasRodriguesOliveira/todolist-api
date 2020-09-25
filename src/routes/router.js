const requireDir = require('require-dir');
const { notin, obj2arr } = require('../helper/util');
const CONFIG = require('./base/config.json');

class Router {
  static getDirectories() {
    const { ignoreFiles, pattern, path } = CONFIG;

    return requireDir(path, {
      filter: function(fullpath) {
        const [file] = fullpath.split('\\').reverse();
        return file.match(new RegExp(pattern)) && notin(fullpath, ignoreFiles);
      }
    });
  }

  static mapRoutes(i, ms) {
    return ms.map(m => i[m](m));
  }

  static getRoutes(dirs, secret, database) {
    const routes = [];

    obj2arr(dirs).forEach(r => {
      Router
        .mapRoutes((new r(secret, database)), r.methods())
        .forEach(m => {
          routes.push(m);
        });
    });

    return routes;
  }
}

module.exports = Router;