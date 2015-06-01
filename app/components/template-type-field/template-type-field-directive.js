'use strict';

angular.module('templateTypeField.directive', [])
  .directive('templateTypeField', function (COMPONENTS_URL) {
    return {
      controller: function (_, $scope, ContentFactory, TEMPLATE_TYPES) {
        $scope.templateTypes = _.filter(TEMPLATE_TYPES, {content_type: $scope.content.polymorphic_ctype});
      },
      restrict: 'E',
      scope: {
        content: '='
      },
      templateUrl: COMPONENTS_URL + 'template-type-field/template-type-field.html'
    };
  });
