'use strict';

angular.module('bulbsCmsApp')
  .directive('featuretypeField', function (PARTIALS_URL, IfExistsElse, ContentFactory,
      Raven, $, CmsConfig) {
    return {
      templateUrl: PARTIALS_URL + 'textlike-autocomplete-field.html',
      restrict: 'E',
      scope: {
        article: '=',
        hideLabel: '='
      },
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'feature_type';
        scope.label = 'Feature Type';
        scope.placeholder = 'Feature Type';
        scope.resourceUrl = CmsConfig.buildBackendApiUrl('things/?type=feature_type&q=');

        scope.$watch('article.feature_type', function () {
          scope.model = scope.article.feature_type;
        });

        scope.display = function (o) {
          return (o && o.name) || '';
        };

        scope.add = function (o, input, freeForm) {
          var fVal = freeForm ? o : o.name;
          IfExistsElse.ifExistsElse(
            ContentFactory.all('things').getList({
              type: 'feature_type',
              q: fVal
            }),
            {
              name: fVal
            },
            function (ft) {
              scope.article.feature_type = ft.name;
              $('#feature-type-container').removeClass('newtag');
            },
            function (value) {
              scope.article.feature_type = value.name;
              $('#feature-type-container').addClass('newtag');
            },
            function (data, status) {
              Raven.captureMessage('Error Adding Feature Type', {extra: data});
            }
          );
        };

        scope.delete = function (e) {
          scope.article.feature_type = null;
        };

      }
    };
  });
