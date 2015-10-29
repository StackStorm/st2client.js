'use strict';

function RequestError(err) {
  if (err instanceof Error) {
    this.message = err.message;
    this.stack = err.stack;
  } else{
    this.message = err;
    this.stack = Error().stack;
  }
}
RequestError.prototype = Object.create(Error.prototype);
RequestError.prototype.name = "RequestError";

module.exports = {
  RequestError: RequestError
};
