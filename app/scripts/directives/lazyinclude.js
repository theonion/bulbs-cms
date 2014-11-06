'use strict';

angular.module('bulbsCmsApp')
  .directive('lazyInclude', function (routes, $, $compile, $q, $http, $templateCache, Gettemplate) {
    /*
      this is like ng-include but it doesn't compile/render the included template
      until the child element is visible
      intended to help with responsiveness by cutting down requests and rendering time
    */

    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        var templateUrl = routes.PARTIALS_URL + attrs.template;
        var $element = $(element);

        scope.$evalAsync(function () {
          scope.$watch(function () {
            return $element.is(':visible');
          }, function (visible) {
            if (visible && !scope.loaded) {
              scope.loaded = true;
              Gettemplate.get(templateUrl).then(function (html) {
                var template = angular.element(html);
                var compiledEl = $compile(template)(scope);
                element.html(compiledEl);
                element.css('height', 'auto');
              });
            }
          });
        });
      }
    };
  });
