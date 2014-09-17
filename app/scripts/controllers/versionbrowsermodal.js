'use strict';

/**
 * This is a modal for browsing versions stored in localStorage by the Localstoragebackup service.
 */
angular.module('bulbsCmsApp')
  .controller('VersionbrowsermodalCtrl', function ($scope, $window, $modalInstance, _, moment, VersionStorageApi) {

    // create a version for most recent
    VersionStorageApi.create($scope.article.body)
      // don't care if this succeeds or fails, just render modal
      .finally(function () {

        VersionStorageApi.all().then(function (versions) {

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

          $scope.preview = function (timestamp, $event) {
            //manipulating dom in a controller is gross! bad!
            $('.version-timestamp-list .active').removeClass('active');
            $($event.target).parent().addClass('active');

            $scope.versionPreview = _.find(versions, function (version) {
              return version.timestamp = timestamp;
            }).content;
          };

          $scope.restoreSelected = function () {
            $scope.article.body = $scope.versionPreview;
            $modalInstance.close();
          };

        });

      });

  });
