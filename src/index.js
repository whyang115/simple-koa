const http = require("http");
const context = require("./context");
const response = require("./response");
const request = require("./request");
const EE = require("events");
module.exports = class App extends EE {
  constructor() {
    super();
    this.callbackFn;
    this.context = context;
    this.middlewareList = [];
  }

  use(fn) {
    this.middlewareList.push(fn);
  }

  /**
   * 组合中间件,使之得以嵌套执行
   */
  compose() {
    return async ctx => {
      function createNext(middleware, oldNext) {
        return async () => {
          await middleware(ctx, oldNext);
        };
      }
      const len = this.middlewareList.length;
      let next = async () => {
        return Promise.resolve();
      };
      for (let i = len - 1; i >= 0; i--) {
        let currMiddleware = this.middlewareList[i];
        next = createNext(currMiddleware, next);
      }
      await next();
    };
  }

  /**
   * 针对每个请求都创建相应的context对象
   * 将自定义的request、response对象挂载到ctx对象上并返回
   * @param {*} req
   * @param {*} res
   */
  createContext(req, res) {
    const ctx = Object.create(context);
    ctx.request = Object.create(request);
    ctx.response = Object.create(response);
    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;
    return ctx;
  }

  /**
   * 根据类型返回处理后的结果
   * @param {*} ctx
   */
  responseBody(ctx) {
    const content = ctx.body;
    if (typeof content === "string") {
      ctx.res.end(content);
      return;
    }
    if (typeof content === "object") {
      ctx.res.end(JSON.stringify(content));
    }
  }

  /**
   * 处理错误
   * @param {*} err
   * @param {*} ctx
   */
  onError(err, ctx) {
    ctx.status = 500;
    if (err.code === "ENOENT") {
      ctx.status = 404;
    }
    let msg = err.message || "Internal Error";
    ctx.res.end(msg);
    this.emit("error", err);
  }

  /**
   * 服务器回调处理函数
   */
  callback() {
    return (req, res) => {
      const ctx = this.createContext(req, res);
      const responseBody = () => this.responseBody(ctx);
      const fn = this.compose();
      fn(ctx)
        .then(responseBody)
        .catch(err => {
          this.onError(err, ctx);
        });
    };
  }

  listen(...args) {
    http.createServer(this.callback()).listen(...args);
  }
};
