'use strict';

angular.module('bulbsCmsApp')
  .factory('VersionBrowserModalOpener', function ($modal, routes) {
    return {
      open: function ($scope, article) {
        return $modal.open({
          templateUrl: routes.PARTIALS_URL + 'modals/version-browser-modal.html',
          controller: 'VersionBrowserModalCtrl',
          scope: $scope,
          size: 'lg',
          resolve: {
            article: function () { return article; }
          }
        });
      }
    };
  });