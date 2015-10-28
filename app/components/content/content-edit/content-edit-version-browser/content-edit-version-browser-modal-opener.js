'use strict';

angular.module('content.edit.versionBrowser.modal.opener', [
  'bulbsCmsApp.settings',
  'content.edit.versionBrowser.modal.controller',
  'utils'
])
  .factory('VersionBrowserModalOpener', [
    '$modal', 'COMPONENTS_URL', 'Utils',
    function ($modal, COMPONENTS_URL, Utils) {

      var modal = null;

      return {
        open: function ($scope, article) {
          // ensure only one version browser modal is open at a time
          if (modal) {
            modal.close();
          }

          modal = $modal.open({
            templateUrl: Utils.path.join(
              COMPONENTS_URL,
              'content',
              'content-edit',
              'content-edit-version-browser',
              'content-edit-version-browser-modal.html'),
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
    }
  ]);
