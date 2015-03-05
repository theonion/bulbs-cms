'use strict';

angular.module('promotedContentSearch.directive', [
  'bulbsCmsApp.settings',
  'statusFilter',
  'filterWidget',
  'promotedContent.service',
  'promotedContentArticle'
])
  .directive('promotedContentSearch', function (routes) {
    return {
      controller: function (_, moment, $scope, $location, PromotedContentService) {

        $scope.pzoneData = PromotedContentService.getData();
        $scope.pageNumber = $location.search().page || '1';

        $scope.goToPage = function () {
          PromotedContentService.$refreshAllContent({page: $scope.pageNumber}, true);
        };

        /**
        * Check if an content is enabled. Actions are allowed if preview time is
        *  set to immediate and the content is already published, or if a preview
        *  time is set into the future and the content will be published before that.
        *  In either case, content is only draggable if it is not already listed.
        *
        * @param {object} content - content to check if enabled.
        * @returns {Boolean} true if content is enabled, false otherwise.
        */
        $scope.contentIsEnabled = function (content) {
          var notAlreadyInList =
            ($scope.pzoneData.selectedPZone &&
            _.isUndefined(_.find($scope.pzoneData.selectedPZone.content, {id: content.id})));
          var immediateDraggable =
            ($scope.pzoneData.previewTime === null &&
              moment().isAfter(content.published));
          var futureDraggable =
            ($scope.pzoneData.previewTime !== null &&
              moment().isBefore($scope.pzoneData.previewTime) &&
              $scope.pzoneData.previewTime.isAfter(content.published));

          return notAlreadyInList && (immediateDraggable || futureDraggable);
        };

        $scope.beginInsert = function (article) {
          PromotedContentService.beginContentInsert(article);
        };

        $scope.beginReplace = function (article) {
          PromotedContentService.beginContentReplace(article);
        };

        $scope.stopAction = function () {
          PromotedContentService.stopContentAction();
        };

      },
      link: function (scope, element, attr) {

        scope.tools = null;
        scope.openToolsFor = function (article) {
          scope.tools = article.id;
          return true;
        };

        scope.closeTools = function () {
          scope.tools = null;
          return true;
        };

        scope.toolsOpenFor = function (article) {
          return scope.tools === article.id;
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-search/promoted-content-search.html'
    };
  });
