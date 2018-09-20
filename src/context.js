let proto = {};
const delegateGet = function(src, target, key) {
  Object.defineProperty(src, key, {
    configurable: true,
    get() {
      return this[target][key];
    }
  });
};

const delegateSet = function(src, target, key) {
  Object.defineProperty(src, key, {
    configurable: true,
    set(val) {
      this[target][key] = val;
    }
  });
};

const requestGetter = ["query"];
const requestSetter = [];
const responseGetter = ["body"];
const responseSetter = ["body", "status"];

requestGetter.forEach(item => delegateGet(proto, "request", item));
requestSetter.forEach(item => delegateSet(proto, "request", item));
responseGetter.forEach(item => delegateGet(proto, "response", item));
responseSetter.forEach(item => delegateSet(proto, "response", item));

module.exports = proto;
