'use strict';

angular.module('promotedContentSave.directive', [
  'bulbsCmsApp.settings',
  'promotedContentSave.controller'
])
  .directive('promotedContentSave', function (routes) {
    return {
      controller: 'PromotedContentSave',
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-save/promoted-content-save.html'
    };
  });
