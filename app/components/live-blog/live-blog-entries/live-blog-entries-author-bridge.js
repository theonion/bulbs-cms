'use strict';

angular.module('bulbs.cms.liveBlog.entries.authorBridge', [
  'bulbs.cms.site.config'
])
  .directive('liveBlogEntriesAuthorBridge', [
    '$compile', 'CmsConfig',
    function ($compile, CmsConfig) {

      return {
        link: function (scope, element) {
          var name = CmsConfig.getLiveBlogAuthorSelectorDirectiveName();

          scope.authors = scope.ngModel;

          if (name) {
            var html = angular.element('<' + name + ' ng-model="authors"></' + name + '>');

            element.find('> div').html($compile(html)(scope));
          }

          scope.$watch('authors', function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
              scope.onUpdate({ newValue: newValue });
              scope.ngModel = newValue;
            }
          }, true);
        },
        restrict: 'E',
        scope: {
          ngModel: '=',
          onUpdate: '&'
        },
        template:
          '<div>' +
            '<i class="fa fa-exclamation-triangle"></i> ' +
            '<span>No live blog author selector has been configured!</span>' +
          '</div>'
      };
    }
  ]);
