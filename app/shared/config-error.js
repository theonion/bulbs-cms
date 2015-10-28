'use strict';

var ConfigError = function (providerName, message) {
  this.name = 'Configuration Error (' + providerName + ')';
  this.message = message || 'Something was misconfigured.';
};
ConfigError.prototype = Object.create(Error.prototype);
ConfigError.prototype.constructor = window.ConfigError;
