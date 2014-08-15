'use strict';

angular.module('bulbsCmsApp')
  .controller('VersionbrowsermodalCtrl', function ($scope, $window, $modalInstance, _, moment, Localstoragebackup, article) {
    /*This is a modal for browsing versions stored in localStorage by the Localstoragebackup service */
    Localstoragebackup.backupToLocalStorage();

    var keys = _.keys($window.localStorage);

    var timestamps = [];
    for (var i in keys) {
      if (keys[i] && (keys[i].split('.')[0] !== Localstoragebackup.keyPrefix || Number(keys[i].split('.')[2]) !== article.id)) {
        continue;
      }
      var timestamp = Number(keys[i].split('.')[1]) * 1000;
      timestamps.push(timestamp);
    }
    $scope.timestamps = timestamps.sort().reverse();

    $scope.preview = function (timestamp, $event) {
      //manipulating dom in a controller is gross! bad!
      $('.version-timestamp-list .active').removeClass('active');
      $($event.target).parent().addClass('active');

      var key = Localstoragebackup.keyPrefix + '.' + timestamp / 1000 + '.' + article.id + '.body';
      var html = $window.localStorage.getItem(key);
      $scope.versionPreview = html;
    };

    $scope.restoreSelected = function () {
      $scope.article.body = $scope.versionPreview;
      $modalInstance.close();
    };
  });
