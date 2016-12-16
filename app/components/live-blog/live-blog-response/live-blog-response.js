
angular.module('bulbs.cms.liveBlog.response', [
  'bulbs.cms.site.config'
])
  .directive('liveBlogResponse', [
    'CmsConfig',
    function (CmsConfig) {

      return {
        link: function (scope, element) {
        },
        restrict: 'E',
        scope: {
          response: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-response',
          'live-blog-response.html'
        )
      };
    }
  ]);
