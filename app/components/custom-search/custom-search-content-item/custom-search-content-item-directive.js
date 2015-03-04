'use strict';

angular.module('customSearch.contentItem.directive', [])
  .directive('customSearchContentItem', function (routes) {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        modifierService: '='
      },
      templateUrl: routes.COMPONENTS_URL + 'custom-search/custom-search-content-item/custom-search-content-item.html'
    };
  });
