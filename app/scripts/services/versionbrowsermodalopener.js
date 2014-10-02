'use strict';

angular.module('bulbsCmsApp')
  .factory('VersionBrowserModalOpener', function ($modal, routes) {
    var modal = null;
    return {
      open: function ($scope, article) {
        // ensure only one version browser modal is open at a time
        if (modal === null) {
          modal = $modal.open({
            templateUrl: routes.PARTIALS_URL + 'modals/version-browser-modal.html',
            controller: 'VersionBrowserModalCtrl',
            scope: $scope,
            size: 'lg',
            resolve: {
              article: function () {
                return article;
              }
            }
          });

          // when modal closes null out reference
          modal.result.then(function () {
            modal = null;
          });
        }

        return modal;
      }
    };
  });