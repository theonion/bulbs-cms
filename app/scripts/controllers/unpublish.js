'use strict';

angular.module('bulbsCmsApp')
  .controller('UnpublishCtrl', function ($scope, $http) {
    $scope.unpublish = function (article) {
      var data = {published: false};
      console.log(" hi")
      return $http({
        url: '/cms/api/v1/content/' + article.id + '/publish/',
        method: 'POST',
        data: data
      });
    }
  });
