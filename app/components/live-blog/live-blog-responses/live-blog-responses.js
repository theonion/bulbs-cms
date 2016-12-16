
angular.module('bulbs.cms.liveBlog.responses', [
  'bulbs.cms.site.config',
  'bulbs.cms.liveBlog.response'
])
  .directive('liveBlogResponses', [
    'CmsConfig',
    function (CmsConfig) {

      return {
        link: function (scope, element) {
        },
        restrict: 'E',
        scope: {
          entry: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-responses',
          'live-blog-responses.html'
        )
      };
    }
  ]);

