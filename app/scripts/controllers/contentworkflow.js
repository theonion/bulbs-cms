'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentworkflowCtrl', function ($scope, $http, $modal, $window, moment,
                                               VersionBrowserModalOpener, TemporaryUrlModalOpener,
                                               CmsConfig) {
    $scope.TIMEZONE_LABEL = moment.tz(CmsConfig.getTimezoneName()).format('z');

    $scope.trashContentModal = function (articleId) {
      return $modal.open({
        templateUrl: '/views/modals/confirm-trash-modal.html',
        controller: 'TrashcontentmodalCtrl',
        scope: $scope,
        resolve: {
          articleId: function () {
            return articleId;
          }
        }
      });
    };

    $scope.pubTimeModal = function (article) {
      return $modal.open({
        templateUrl: '/views/modals/publish-date-modal.html',
        controller: 'PubtimemodalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.sendToEditorModal = function (article) {
      return $modal.open({
        templateUrl: '/views/modals/send-to-editor-modal.html',
        controller: 'SendtoeditormodalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.changelogModal = function (article) {
      return $modal.open({
        templateUrl: '/views/modals/changelog-modal.html',
        controller: 'ChangelogmodalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.thumbnailModal = function (article) {
      // open thumbnail modal along with its controller
      return $modal.open({
        templateUrl: '/views/modals/thumbnail-modal.html',
        controller: 'ThumbnailModalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.versionBrowserModal = function (article) {
      VersionBrowserModalOpener.open($scope, article);
    };

    $scope.temporaryUrlModal = function (article) {
      TemporaryUrlModalOpener.open($scope, article);
    };

    $scope.descriptionModal = function (article) {
      return $modal.open({
        templateUrl: '/views/modals/description-modal.html',
        controller: 'DescriptionModalCtrl',
        scope: $scope,
        size: 'lg',
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.getStatus = function (article) {
      if (!article || !article.published) {
        return 'unpublished';
      } else if (moment(article.published) > moment()) {
        return 'scheduled';
      } else {
        return 'published';
      }
    };

  });
