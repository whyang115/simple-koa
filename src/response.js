module.exports = {
  get body() {
    return this._body;
  },
  set body(data) {
    this._body = data;
  },
  get status() {
    return this.res.statusCode;
  },
  set status(code) {
    if (typeof code !== "number") {
      throw new Error(`status must be number but get ${typeof code} `);
    }
    this.res.statusCode = code;
  }
};
