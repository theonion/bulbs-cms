'use strict';

angular.module('cms.tunic.interceptor', [
  'cms.tunic.config'
])
  .service('TunicInterceptor', [
    'TunicConfig',
    function (TunicConfig) {

      this.request = function (config) {
        if (TunicConfig.shouldBeIntercepted(config.url)) {
            config.headers = config.headers || {};
            config.headers.Authorization = 'Token ' + TunicConfig.getRequestToken();
        }
        return config;
      };

      return this;
    }
  ]);
