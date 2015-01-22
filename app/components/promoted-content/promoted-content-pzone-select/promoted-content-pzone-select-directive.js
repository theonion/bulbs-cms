'use strict';

angular.module('promotedContentPzoneSelect.directive', [
  'bulbsCmsApp.settings',
  'promotedContentPzoneSelect.controller'
])
  .directive('promotedContentPzoneSelect', function (routes) {
    return {
      controller: 'PromotedContentPzoneSelect',
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-pzone-select/promoted-content-pzone-select.html'
    };
  });
