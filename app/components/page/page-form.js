'use strict';

angular.module('bulbs.cms.page.form', [
  'bulbs.cms.site.config'
])
  .directive('pageForm', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        restrict: 'E',
        scope: {
          pageData: '='
        },
        templateUrl: CmsConfig.buildComponentPath('page', 'page-form.html')
      };
    }
  ]);
