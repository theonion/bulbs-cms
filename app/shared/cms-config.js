'use strict';

angular.module('bulbs.cms.config', [
  'bulbs.cms.utils',
  'lodash'
])
  .provider('CmsConfig', [
    '_', 'UtilsProvider',
    function (_, Utils) {
      var api
    }
  ]);
