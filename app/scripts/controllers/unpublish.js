'use strict';

angular.module('bulbsCmsApp')
  .controller('UnpublishCtrl', function ($scope, $http, $q, CmsConfig) {

    $scope.unpubButton = {
      idle: 'Unpublish',
      busy: 'Unpublishing',
      finished: 'Unpublished!',
      error: 'Error'
    };


    $scope.unpublish = function () {
      return $http({
        url: CmsConfig.buildBackendUrl('content/' + $scope.article.id + '/publish/'),
        method: 'POST',
        data: {published: false}
      });
    };

    $scope.unpublishCbk = function (unpub_promise) {
      unpub_promise
        .then(function (result) {
          if ($scope.publishSuccessCbk) {
            $scope.publishSuccessCbk({article: $scope.article, response: result.data});
          }
        })
        .catch(function (reason) {
          if ($scope.publishSuccessCbk) {
            $scope.publishSuccessCbk({article: $scope.article, response: reason.data});
          }
        });
    };

  });
