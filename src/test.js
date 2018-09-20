const Koa = require("./");

const app = new Koa();

app.context.echoData = function(errno = 0, data = null, errMsg = "") {
  this.res.setHeader("Content-Type", "application/json;charset=utf-8");
  this.body = {
    errno,
    data,
    errMsg
  };
};
const responseData = {};
app.use(async (ctx, next) => {
  responseData.name = "whyang";
  await next();
  ctx.body = responseData;
});
app.use(async (ctx, next) => {
  responseData.age = 22;
  await next();
});
app.use(async ctx => {
  responseData.gender = "male";
  throw new Error("some error");
});
app.on("error", err => {
  console.log(err);
});
app.listen(1105, (...args) => {
  console.log("server is running in port 1105");
  console.log(...args);
});
