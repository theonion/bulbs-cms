'use strict';

angular.module('bulbs.cms.contentSearch', [
  'autocompleteBasic',
  'bulbs.cms.site.config',
  'contentServices.factory',
  'lodash'
])
  .directive('contentSearch', [
    '_', 'CmsConfig', 'ContentFactory',
    function (_, CmsConfig, ContentFactory) {

      return {
        link: function (scope, element, attrs, ngModelCtrl) {

          scope.itemDisplayFormatter = function (content) {
            if (_.isObject(content)) {
              return content.title + ' - ' + content.id;
            }
          };

          scope.itemValueFormatter = function (content) {
            // relatively heavy handed transformation to an id, will have to
            //  reconsider this if another usage for this search comes up where
            //  we need to return the entire content piece.
            return _.isObject(content) ? content.id : null;
          };

          scope.searchContent = function (searchTerm) {
            return ContentFactory.all('content')
              .getList({ search: searchTerm });
          };

          if (ngModelCtrl) {

            scope.ngModel = ngModelCtrl;

            ngModelCtrl.$render = function () {
              if (_.isNumber(ngModelCtrl.$modelValue) && !scope.initialValue) {
                ContentFactory.one('content', ngModelCtrl.$modelValue).get()
                  .then(function (content) {
                    scope.initialValue = scope.itemDisplayFormatter(content);
                  });
              }
            };

            scope.autocompleteOnSelect = function () {
              ngModelCtrl.$commitViewValue();
            };
          } else {
            scope.autocompleteOnSelect = function (selection) {
              scope.onSelect({ selection: scope.itemValueFormatter(selection.value) });
            };
          }
        },
        require: '?ngModel',
        restrict: 'E',
        scope: {
          inputId: '@',
          onSelect: '&',
          ngDisabled: '&'
        },
        templateUrl: CmsConfig.buildComponentPath(
          'content-search',
          'content-search.html'
        )
      };
    }
  ]);

