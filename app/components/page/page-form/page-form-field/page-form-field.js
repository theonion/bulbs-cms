'use strict';

angular.module('bulbs.cms.page.form.field', [
  'bulbs.cms.site.config'
])
  .directive('pageFormField', [
    '$compile', 'CmsConfig',
    function ($compile, CmsConfig) {
      var FieldMap = {
        text: 'page-form-field-text'
      };

      return {
        link: function (scope, element) {
          var directiveName = FieldMap[scope.schema.type];
          var el = $compile('<' + directiveName + '></' + directiveName + '>')(scope);
          element.append(el);
        },
        require: '^^pageForm',
        restrict: 'E',
        scope: {
          schema: '=',
          value: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'page',
          'page-form',
          'page-form-field',
          'page-form-field.html'
        )
      }
    }
  ]);
