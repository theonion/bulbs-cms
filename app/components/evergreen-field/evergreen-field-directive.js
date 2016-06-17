'use strict';

angular.module('evergreenField.directive', [
  'lodash',
  'saveButton.directive'
])
  .directive('evergreenField', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: CmsConfig.buildComponentPath('evergreen-field/evergreen-field.html')
      };
    }
  ]);
