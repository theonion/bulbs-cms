'use strict';

angular.module('bulbs.cms.liveBlog.entries.authorBridge', [
  'bulbs.cms.site.config'
])
  .directive('liveBlogEntriesAuthorBridge', [
    '$compile', 'CmsConfig',
    function ($compile, CmsConfig) {

      return {
        link: function (scope, element, attrs) {
          var name = CmsConfig.getLiveBlogAuthorSelectorDirectiveName();

          if (name) {
            var html = angular.element('<' + name + ' ng-model="ngModel"></' + name + '>');

            Object.keys(attrs).forEach(function (key) {
              if (!key.startsWith('$') && key !== 'ngModel') {
                html.attr(key, attrs[key]);
              }
            });

            element.find('> div').html($compile(html)(scope));
          }
        },
        restrict: 'E',
        scope: {
          ngModel: '='
        },
        template:
          '<div>' +
            '<i class="fa fa-exclamation-triangle"></i> ' +
            '<span>No live blog author selector has been configured!</span>' +
          '</div>'
      };
    }
  ]);
