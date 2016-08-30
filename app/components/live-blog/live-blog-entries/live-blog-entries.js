'use strict';

angular.module('bulbs.cms.liveBlog.entries', [
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.liveBlog.api',
  'bulbs.cms.site.config',
  'confirmationModal',
  'OnionEditor',
  'Raven'
])
  .directive('liveBlogEntries', [
    'CmsConfig', 'LiveBlogApi', 'Raven',
    function (CmsConfig, LiveBlogApi, Raven) {
      return {
        link: function (scope) {
          var reportError = function (message, data) {
            Raven.captureMessage(message, data);
            scope.errorMessage = message;
          };

          scope.clearError = function () {
            scope.errorMessage = '';
          };

          scope.$watch('entries', function (newEntries, oldEntries) {
            if (!angular.equals(newEntries, oldEntries)) {
              scope.clearError();
            }
          }, true);

          LiveBlogApi.getLiveBlogEntries(scope.article.id)
            .then(function (response) {
              scope.entries = response.results;
            })
            .catch(function (response) {
              var message = 'An error occurred retrieving entries!';
              reportError(message, { response: response });
            });
        },
        scope: {
          article: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-entries',
          'live-blog-entries.html'
        )
      };
    }
  ]);
