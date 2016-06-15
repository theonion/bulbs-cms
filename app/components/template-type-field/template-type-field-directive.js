'use strict';

angular.module('templateTypeField.directive', [
  'bulbs.cms.site.config'
])
  .directive('templateTypeField', function (CmsConfig) {
    return {
      controller: function (_, $scope, ContentFactory, TEMPLATE_TYPES) {
        $scope.templateTypes = _.filter(TEMPLATE_TYPES, {content_type: $scope.content.polymorphic_ctype});
      },
      restrict: 'E',
      scope: {
        content: '='
      },
      templateUrl: CmsConfig.buildComponentPath('template-type-field/template-type-field.html')
    };
  });
