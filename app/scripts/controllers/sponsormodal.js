'use strict';

angular.module('bulbsCmsApp')
  .controller('SponsormodalCtrl', function ($scope, ContentFactory, article, Campaign) {
    $scope.article = article;

    if ($scope.article.campaign) {
      $scope.campaign = Campaign.$find($scope.article.campaign);
    } else {
      $scope.campaign = null;
    }

    $scope.updateArticle = function (selection) {
      $scope.article.campaign = selection.value.id;
    };

    $scope.searchCampaigns = function (searchTerm) {
      return Campaign.simpleSearch(searchTerm);
    };
  });
