
angular.module('bulbs.cms.liveBlog.responses', [
  'bulbs.cms.site.config',
  'bulbs.cms.liveBlog.response'
])
  .directive('liveBlogResponses', [
    'CmsConfig',
    function (CmsConfig) {

      return {
        link: function (scope, element) {

          var panelOpen = {};
          scope.isPanelOpen = function (response) {
            if (angular.isUndefined(panelOpen[response.id])) {
              panelOpen[response.id] = true;
            }
            return panelOpen[response.id];
          };
          scope.togglePanel = function (response) {
            panelOpen[response.id] = !panelOpen[response.id];
          };
          scope.collapseAll = function () {
            scope.entry.responses.forEach(function (response) {
              panelOpen[response.id] = false;
            });
          };
          scope.expandAll = function () {
            scope.entry.responses.forEach(function (response) {
              panelOpen[response.id] = true;
            });
          };

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

