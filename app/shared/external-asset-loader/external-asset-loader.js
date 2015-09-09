;(function (global) {
  'use strict';

  /**
   * Insert assets from external sources, optionally cache busted.
   */
  global.ExternalAssetLoader = (function () {

    var _checkCacheBust = function (url, cacheBust) {
      return cacheBust ? url + '?' + (new Date()).valueOf() : url;
    };

    var _insert = function (element, type, insertLocation) {
      var firstOfType = insertLocation.querySelectorAll(type);
      insertLocation.insertBefore(element, firstOfType[0]);
    };

    var service = {};

    service.TYPES = {
      STYLE: 'link',
      SCRIPT: 'script'
    };

    service.addAsset = function (optsIn) {
      var element;

      if (typeof optsIn.url !== 'string') {
        throw new Error('ExternalAssetLoader: Must define asset url string to load.');
      } else if (typeof optsIn.type !== 'string') {
        throw new Error('ExternalAssetLoader: Must define an asset type string to load.');
      }

      if (optsIn.type === this.TYPES.STYLE) {
        element = document.createElement(optsIn.type);

        element.href = _checkCacheBust(optsIn.url, optsIn.cacheBust);
        element.rel = 'stylesheet';

        _insert(element, optsIn.type, document.head);
      } else if (optsIn.type === this.TYPES.SCRIPT) {
        element = document.createElement(optsIn.type);

        element.src = _checkCacheBust(optsIn.url, optsIn.cacheBust);

        _insert(element, optsIn.type, document.head);
      }

      return element;
    };

    return service;
  })();
})(window);
