'use strict';

window.BulbsCmsError = function (name, message) {
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }

  this.name = name || 'CMS Error';
  this.message = message || 'Something was misconfigured.';
};
BulbsCmsError.prototype = Object.create(Error.prototype);
BulbsCmsError.prototype.constructor = window.BulbsCmsError;

/**
 * Create an error factory for a given provider.
 *
 * @param {string} name - used as name for instances.
 * @returns factory that produces BulbsCmsError with the given name.
 */
BulbsCmsError.build = function (name) {
  return function (message) {
    return new BulbsCmsError(name, message);
  };
};

window.BulbsCmsConfigError = function (name, message) {
  window.BulbsCmsError.call(this, name, message);
};

BulbsCmsConfigError.prototype = Object.create(window.BulbsCmsError.prototype);
BulbsCmsConfigError.prototype.constructor = window.BulbsCmsConfigError;

BulbsCmsConfigError.build = function (name) {
  return function (message) {
    return new BulbsCmsConfigError(
      'Configuration Error (' + (name || 'name not given!') + ')',
      message
    );
  };
};
