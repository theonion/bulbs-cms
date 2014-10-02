'use strict';

angular.module('bulbsCmsApp')
  .factory('VersionBrowserModalOpener', function ($modal, routes) {
    var modal = null;
    return {
      open: function ($scope, article) {
        // ensure any version browser modals are closed before opening a new one
        if (modal) {
          modal.close();
        }

        modal = $modal.open({
          templateUrl: routes.PARTIALS_URL + 'modals/version-browser-modal.html',
          controller: 'VersionBrowserModalCtrl',
          scope: $scope,
          size: 'lg',
          resolve: {
            article: function () { return article; }
          }
        });

        return modal;
      }
    };
  });