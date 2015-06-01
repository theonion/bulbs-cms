'use strict';

angular.module('customSearch.contentItem.directive', [
  'bulbsCmsApp.settings'
])
  .directive('customSearchContentItem', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        controllerService: '=',
        onUpdate: '&'
      },
      templateUrl: COMPONENTS_URL + 'custom-search/custom-search-content-item/custom-search-content-item.html'
    };
  });
