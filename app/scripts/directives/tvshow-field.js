'use strict';

angular.module('bulbsCmsApp')
  .directive('tvshowField', function () {
    return {
      templateUrl: routes.PARTIALS_URL + 'textlike-autocomplete-field.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'tvshow';
        scope.label = 'Show';
        scope.placeholder = 'The Simpsons';
        scope.resourceUrl = '/reviews/api/v1/tvshow/?q=';

        scope.display = scope.tvShowDisplay;
        scope.add = scope.tvShowCallback;
        scope.delete = scope.tvShowRemove;

      }
    };
  });
