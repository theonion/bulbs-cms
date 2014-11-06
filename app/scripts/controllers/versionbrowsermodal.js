'use strict';

/**
 * This is a modal for browsing versions stored in localStorage by the LocalStorageBackup service.
 */
angular.module('bulbsCmsApp')
  .controller('VersionBrowserModalCtrl', function ($scope, $modalInstance, _, moment, VersionStorageApi,
                                                   FirebaseApi, FIREBASE_ARTICLE_MAX_VERSIONS) {

    // if we have fire base, show the maximum number of versions allowed
    FirebaseApi.$authorize().then(function () {
      $scope.maxVersions =  FIREBASE_ARTICLE_MAX_VERSIONS;
    });

    VersionStorageApi.$all()
      .then(function (versions) {

        // doubley ensure timestamp in desc since modal functionality depends on it, add some extra display stuff
        $scope.versions =
          _.chain(versions)
            // loop through each version and add timestamp display property
            .each(function (version) {
              version.timestamp_display = moment(version.timestamp).format('MMM Do YYYY, h:mma');
            })
            // sort by timestamps desc, so most recent is on top
            .sortBy(function (version) {
              return -version.timestamp;
            })
          .value();

        // set initial preview to top item which should be the most recent
        $scope.selectedVersion = $scope.versions[0];

        // set preview in modal window based on timestamp
        $scope.setPreview = function (version) {
          $scope.selectedVersion = version;
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
