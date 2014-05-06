'use strict';

angular.module('bulbsCmsApp')
  .controller('VersionbrowsermodalCtrl', function ($scope, $window, $modalInstance, _, moment, article) {
    $scope.backupToLocalStorage();

    var keys = _.keys($window.localStorage);
    var timestamps = []
    var prefix = 'articleBodyBackup';
    for(var i in keys){
      if(keys[i] && keys[i].split('.')[0] != prefix && keys[i].split('.')[2] != article.id){
        continue;
      }
      var timestamp = Number(keys[i].split('.')[1]) * 1000;
      timestamps.push(timestamp);
    }
    $scope.timestamps = timestamps.sort();

    $scope.preview = function (timestamp) {
      var key = prefix + '.' + timestamp/1000 + '.' + article.id + '.body';
      var html = $window.localStorage.getItem(key);
      console.log(key)
      console.log(html)
      $scope.versionPreview = html;
    };
  });
