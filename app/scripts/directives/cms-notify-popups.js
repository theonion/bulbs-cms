'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotifyPopups', function () {
    return {
      restrict: 'E',
      scope: {},
      controller: 'CmsNotifyPopupsCtrl'
    }
  });