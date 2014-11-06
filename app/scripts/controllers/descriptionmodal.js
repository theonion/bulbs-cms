'use strict';

angular.module('bulbsCmsApp')
  .controller('DescriptionModalCtrl', function ($scope, $modalInstance, article) {
    $scope.article = article;
  });
