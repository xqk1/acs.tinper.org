const path = require('path')
const ip = require("ip")
const bodyParser = require('koa-bodyparser')
const nunjucks = require('koa-nunjucks-2')
const staticFiles = require('koa-static')
const send = require('./send')
const log = require('./logger')
const httpError = require('./http-error')
// 引入路由规则中件间
const rules = require('./rules')

module.exports = (app) => {

  // app.use(log({
  //   env: app.env,
  //   projectName: 'ucf-node',
  //   appLogLevel: 'debug',
  //   dir: 'logs',
  //   serverIp: ip.address()
  // }));



  const static = staticFiles(path.join(__dirname,'../../static'));
  const tinperAcs = staticFiles(path.join(__dirname,'../../tinper-acs'));

  app.use(static);
  app.use(tinperAcs);

  app.use(nunjucks({
    ext: 'html',
    path: path.join(__dirname, '../views'),
    nunjucksConfig: {
      trimBlocks: true
    }
  }));

  app.use(bodyParser())
  app.use(send())
  
  rules({
    app,
    rules: [
      {
        folder: path.join(__dirname, '../controller'),
        name: 'controller'
      },
      {
        folder: path.join(__dirname, '../service'),
        name: 'service'
      }
    ]
  })

  // 增加错误的监听处理
  app.on("error", (err, ctx) => {
    if (ctx && !ctx.headerSent && ctx.status < 500) {
      ctx.status = 500
    }
    if (ctx && ctx.log && ctx.log.error) {
      if (!ctx.state.logged) {
        ctx.log.error(err.stack)
      }
    }
  }) 
}
