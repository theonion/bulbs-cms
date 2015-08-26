'use strict';

angular.module('bulbsCmsApp')
  .directive('contributorField', function (routes, userFilter, $) {
    return {
      templateUrl: routes.PARTIALS_URL + 'textlike-autocomplete-field.html',
      restrict: 'E',
      replace: true,
      scope: {
        override: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.name = 'contributor';
        scope.label = 'Contributors';
        scope.placeholder = 'Contributors';
        scope.resourceUrl = '/cms/api/v1/author/?ordering=name&search=';
        scope.display = userFilter;

        scope.$watch('model.contributor', function () {
          scope.model = scope.override.contributor;
        });

        scope.display = function (o) {
          return (o && o.full_name) || '';
        };

        scope.add = function(o, input) {
          if (!scope.override.hasOwnProperty('contributor')) {
            scope.override.contributor = null;
          }

          if (scope.override.hasOwnProperty('contributor')) {
            if (scope.override.contributor.id === o.id) { return; }
          }

          scope.override.contributor = o;
          $(input).val('');
        };

        scope.delete = function (e) {
          scope.override.contributor = null;
        };

      }
    };
  });