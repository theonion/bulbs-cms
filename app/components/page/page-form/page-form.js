'use strict';

angular.module('bulbs.cms.page.form', [
  'bulbs.cms.page.form.field.text'
])
  .directive('pageForm', [
    '$compile',
    function ($compile) {
      var DIRECTIVE_NAMES_MAP = {
        text: 'page-form-field-text'
      };

      return {
        link: function (scope, element) {
          var $form = element.find('form');

          var renderFormElements = function () {
            Object.keys(scope.pageData.fields).forEach(function (id) {
              var tagName = DIRECTIVE_NAMES_MAP[scope.pageData.fields[id].field_type];

              var html = angular.element('<' + tagName + '></' + tagName + '>');
              html.attr('name', id);
              html.attr('schema', 'pageData.fields.' + id);
              html.attr('ng-model', 'pageData.values.' + id);

              $form.append(html);
              $compile(html)(scope);
            });
          };

          scope.$watch(scope.pageData, renderFormElements);
        },
        restrict: 'E',
        scope: {
          pageData: '='
        },
        template: '<form name="pageForm"></form>'
      };
    }
  ]);
