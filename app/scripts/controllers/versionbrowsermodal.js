'use strict';

/**
 * This is a modal for browsing versions stored in localStorage by the Localstoragebackup service.
 */
angular.module('bulbsCmsApp')
  .controller('VersionbrowsermodalCtrl', function ($scope, $window, $modalInstance, _, moment, VersionStorageApi) {

    VersionStorageApi.all()
      .then(function (versions) {

        // create timestamp displays
        $scope.timestamps = _.chain(versions)
          // pull out timestamp info
          .pluck('timestamp')
          // transform timestamps to human readable versions
          .map(function (timestamp) {
            return {
              ms: timestamp,
              display: moment(timestamp).format('ddd, MMM Do YYYY, h:ma')
            };
          })
          // resolve this chain to an array of objects for the chooser
          .value();

        // set initial preview to top item which should be the most recent
        $scope.selectedVersion = versions[0];

        // set preview in modal window based on timestamp
        $scope.setPreview = function (timestamp) {
          $scope.selectedVersion = _.find(versions, function (version) {
            return version.timestamp === timestamp;
          });
        };

        // restore selected version preview
        $scope.restoreSelected = function () {

          // loop through each key of selected version and replace corresponding value in article
          _.each($scope.selectedVersion.content, function (value, key) {
            $scope.article[key] = value;
          });

          // mark article as dirty now that we've restored an old version
          $scope.articleIsDirty = true;

          // close modal
          $modalInstance.close();
        };

      });

  });
