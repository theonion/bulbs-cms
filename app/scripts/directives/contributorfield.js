'use strict';

angular.module('bulbsCmsApp')
  .directive('contributorField', [
    '$', 'PARTIALS_URL', 'Utils',
    function ($, PARTIALS_URL, Utils) {
      return {
        templateUrl: Utils.path.join(
          PARTIALS_URL,
          'textlike-autocomplete-field.html'
        ),
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

          scope.$watch('override.contributor', function () {
            if ((scope.override.hasOwnProperty('contributor')) && (scope.override.contributor !== null)) {
              scope.model = scope.override.contributor.full_name || scope.override.contributor.fullName;
            }
          });

          scope.display = function (o) {
            return (o && o.full_name) || '';
          };

          scope.add = function(o, input) {
            if ((scope.override.hasOwnProperty('contributor')) && scope.override.contributor !== null) {
              if (scope.override.contributor.id === o.id) {
                return;
              }
            }

            scope.override.contributor = o;
            $('#feature-type-container').removeClass('newtag');
            $('#feature-type-container').addClass('newtag');
          };

          scope.delete = function (e) {
            scope.override.contributor = null;
            scope.model = null;
          };

        }
      };
    }
  ]);
