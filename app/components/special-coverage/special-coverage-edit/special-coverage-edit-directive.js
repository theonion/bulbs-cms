'use strict';

angular.module('specialCoverage.edit.directive', [
  'apiServices.campaign.factory',
  'apiServices.specialCoverage.factory',
  'bulbs.cms.site.config',
  'bulbsCmsApp.settings',
  'campaignAutocomplete',
  'copyButton',
  'customSearch',
  'lodash',
  'specialCoverage.settings',
  'topBar',
  'ui.bootstrap.tooltip',
  'videoList'
])
  .directive('specialCoverageEdit', function (CmsConfig) {
    return {
      controller: function (_, $location, $q, $scope, $modal, Campaign, EXTERNAL_URL,
          SPECIAL_COVERAGE_LIST_REL_PATH, SpecialCoverage) {

        $scope.ACTIVE_STATES = SpecialCoverage.ACTIVE_STATES;
        $scope.LIST_URL = EXTERNAL_URL + SPECIAL_COVERAGE_LIST_REL_PATH;

        $scope.needsSave = false;

        $scope.tunicCampaignIdMapping = {};

        var modelId = $scope.getModelId();
        if (modelId === 'new') {
          // this is a new special coverage, build it
          $scope.model = SpecialCoverage.$build();
          $scope.isNew = true;
        } else {
          // this is an existing special coverage, find it
          $scope.model = SpecialCoverage.$find($scope.getModelId()).$then(function () {
            $scope.model.$loadTunicCampaign().then(function (campaign) {
              $scope.tunicCampaignIdMapping[campaign.id] = campaign;
            });
          });
        }


        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            // unsaved changes, show confirmation alert
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function() {
          // ensure even is cleaned up when we leave
          delete window.onbeforeunload;
        });

        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            // have model, use save promise as deferred
            promise = $scope.model.$save().$asPromise().then(function (data) {
              if (modelId === 'new') {
                $location.path('/cms/app/special-coverage/edit/' + data.id + '/');
              }
              $scope.isNew = false;
              $scope.needsSave = false;
            });
          } else {
            // no model, this is an error, defer and reject
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };

        $scope.previewLinkModal = function () {
          return $modal.open({
            templateUrl: routes.PARTIALS_URL + 'modals/preview-link-modal.html',
            scope: $scope,
            resolve: {}
          });
        };

        $scope.tunicCampaignFormatter = function (campaignId) {
          if (campaignId in $scope.tunicCampaignIdMapping) {
            var campaign = $scope.tunicCampaignIdMapping[campaignId];
            return campaign.name + ' - ' + campaign.number;
          }
        };

        $scope.searchCampaigns = function (searchTerm) {
          return $scope.model.$searchCampaigns({search: searchTerm}).then(function (campaigns) {
            campaigns.forEach(function (campaign) {
              $scope.tunicCampaignIdMapping[campaign.id] = campaign;
            });
            // Formatter expects list of IDs
            return campaigns.map(function (campaign) { return campaign.id; });
          });
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: CmsConfig.buildComponentPath('special-coverage/special-coverage-edit/special-coverage-edit.html')
    };
  });
