var BulbsCmsConfigError = function (providerName, message) {
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }

  this.name = 'Configuration Error (' + (providerName || 'provider name not given!') + ')';
  this.message = message || 'Something was misconfigured.';
};
BulbsCmsConfigError.prototype = Object.create(Error.prototype);
BulbsCmsConfigError.prototype.constructor = window.BulbsCmsConfigError;

/**
 * Create an error factory for a given provider.
 *
 * @param {string} providerName - used as providerName for instances.
 * @returns factory that produces BulbsCmsConfigError with the given providerName.
 */
BulbsCmsConfigError.build = function (providerName) {
  return function (message) {
    return new BulbsCmsConfigError(providerName, message);
  };
};
