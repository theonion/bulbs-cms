var BulbsCmsConfigError = function (name, message) {
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }

  this.name = 'Configuration Error (' + (name || 'name not given!') + ')';
  this.message = message || 'Something was misconfigured.';
};
BulbsCmsConfigError.prototype = Object.create(Error.prototype);
BulbsCmsConfigError.prototype.constructor = window.BulbsCmsConfigError;

/**
 * Create an error factory for a given provider.
 *
 * @param {string} name - used as name for instances.
 * @returns factory that produces BulbsCmsConfigError with the given name.
 */
BulbsCmsConfigError.build = function (name) {
  return function (message) {
    return new BulbsCmsConfigError(name, message);
  };
};
