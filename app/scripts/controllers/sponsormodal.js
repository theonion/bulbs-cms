'use strict';

angular.module('bulbsCmsApp')
  .controller('SponsormodalCtrl', function ($scope, ContentApi, article) {
    $scope.article = article;

    ContentApi.all('sponsor').getList().then(function (data) {
      $scope.sponsors = data;
    });

    $scope.selectSponsor = function (sponsor) {
      $scope.article.sponsor = sponsor.id;
    };

    $scope.clearSponsor = function () {
      $scope.article.sponsor = null;
    };


  });
