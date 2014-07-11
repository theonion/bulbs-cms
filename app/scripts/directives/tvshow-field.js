'use strict';

angular.module('bulbsCmsApp')
  .directive('tvshowField', function (routes) {
    return {
      templateUrl: routes.PARTIALS_URL + 'textlike-autocomplete-field.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'tvshow';
        scope.label = 'Show';
        scope.placeholder = 'The Simpsons';
        scope.resourceUrl = '/reviews/api/v1/tvshow/?q=';

        scope.$watch('article.ratings', function(){
          scope.model = scope.article.ratings[scope.index].media_item.show;
        }, true);

        scope.display = scope.tvShowDisplay;
        scope.add = scope.tvShowCallback;
        scope.delete = scope.tvShowRemove;

        $(element).on('blur', 'input', function(){
          scope.add($(element).find('input').val(), null, true);
        });
      }
    };
  });
