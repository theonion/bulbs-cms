'use strict';

angular.module('bulbsCmsApp')
  .factory('VersionBrowserModalOpener', function ($modal) {

    var modal = null;

    return {
      open: function ($scope, article) {
        // ensure only one version browser modal is open at a time
        if (modal) {
          modal.close();
        }

        modal = $modal.open({
          templateUrl: '/views/modals/version-browser-modal.html',
          controller: 'VersionBrowserModalCtrl',
          scope: $scope,
          size: 'lg',
          resolve: {
            article: function () {
              return article;
            }
          }
        });

        return modal;
      }
    };
  });
