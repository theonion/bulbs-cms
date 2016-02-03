'use strict';

angular.module('bulbsCmsApp')
  .controller('SponsormodalCtrl', function ($scope, ContentFactory, article, Campaign,
                                            // NOTE: temp depdendencies will be moved along with searchCampaigns/loadCampaigns
                                            _, $q, $http, TunicConfig) {
    $scope.article = article;

    $scope.tunicCampaignIdMapping = {};

    // --------------------------- TODO: MOVE ME SOMEWHERE ELSE---------------------------------------
    var $loadTunicCampaign = function (tunicCampaignId) {
      if (_.isNumber(tunicCampaignId)) {
        return $http.get(TunicConfig.buildBackendApiUrl('campaign/' + tunicCampaignId + '/')).then(function (result) {
          return result.data;
        });
      }
      return $q.reject();
    };

    var $searchCampaigns = function (params) {
      return $http.get(TunicConfig.buildBackendApiUrl('campaign/'), {
        params: params,
      }).then(function (response) {
        return response.data.results;
      });
    };
    // --------------------------- END TODO ---------------------------------------

    if ($scope.article.tunic_campaign_id) {
      $loadTunicCampaign($scope.article.tunic_campaign_id).then(function (campaign) {
        $scope.tunicCampaignId = campaign.id;
        $scope.tunicCampaignIdMapping[campaign.id] = campaign;
      });
    } else {
      $scope.tunicCampaignId = null;
    }

    $scope.updateArticle = function (selection) {
      if (selection === null) {
        $scope.article.tunic_campaign_id = null;
      } else {
        $scope.article.tunic_campaign_id = selection.value;
      }
    };

    $scope.searchCampaigns = function (searchTerm) {
      return $searchCampaigns({search: searchTerm}).then(function (campaigns) {
        campaigns.forEach(function (campaign) {
          $scope.tunicCampaignIdMapping[campaign.id] = campaign;
        });
        // Formatter expects list of IDs
        return campaigns.map(function (campaign) { return campaign.id; });
      });
    };

    $scope.tunicCampaignFormatter = function (campaignId) {
      if (campaignId in $scope.tunicCampaignIdMapping) {
        var campaign = $scope.tunicCampaignIdMapping[campaignId];
        return campaign.name + ' - ' + campaign.number;
      }
    };
  });
