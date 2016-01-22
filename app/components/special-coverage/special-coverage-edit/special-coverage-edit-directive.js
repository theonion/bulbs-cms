'use strict';

angular.module('specialCoverage.edit.directive', [
  'apiServices.specialCoverage.factory',
  'autocompleteBasic',
  'bulbsCmsApp.settings',
  'apiServices.campaign.factory',
  'customSearch',
  'lodash',
  'specialCoverage.settings',
  'topBar',
  'ui.bootstrap.tooltip',
  'videoList'
])
  .directive('specialCoverageEdit', function (routes) {
    return {
      controller: function (_, $location, $q, $scope, $http, Campaign, EXTERNAL_URL,
          SPECIAL_COVERAGE_LIST_REL_PATH, SpecialCoverage) {

        $scope.ACTIVE_STATES = SpecialCoverage.ACTIVE_STATES;
        $scope.LIST_URL = EXTERNAL_URL + SPECIAL_COVERAGE_LIST_REL_PATH;

        $scope.needsSave = false;

        var modelId = $scope.getModelId();
        if (modelId === 'new') {
          // this is a new special coverage, build it
          $scope.model = SpecialCoverage.$build();
          $scope.isNew = true;
        } else {
          // this is an existing special coverage, find it
          $scope.model = SpecialCoverage.$find($scope.getModelId());
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

        // Maps ID to Object for formatting (since only tunic_campaign_id stored on SpecialCoverage object)
        $scope.tunicCampaignIdMapping = {};
        $scope.campaignsRetrieved = function (response) {
          response.data.results.forEach(function (result) {
            $scope.tunicCampaignIdMapping[result.id] = result;
          });
          var tunicCampaignIds = [];
          response.data.results.forEach(function (result) {
            tunicCampaignIds.push(result.id);
          });
          return tunicCampaignIds;
        };

        $scope.getCampaign = function (tunicCampaignId) {
          return $http.get('http://tunic.local/api/v1/campaign/' + tunicCampaignId + '/', {
            headers: {
              'Authorization': 'Token 246bce7a5ddaed1fd497ed9b53d0a2281e3928f5'
            }
          }).then(function (result) {
            $scope.tunicCampaignIdMapping[result.data.id] = result.data;
          });
        };

        $scope.tunicCampaignFormatter = function (tunicCampaignId) {
            if ( ! (tunicCampaignId in $scope.tunicCampaignIdMapping)) {
              $scope.getCampaign(tunicCampaignId);
            }
            var obj = $scope.tunicCampaignIdMapping[tunicCampaignId];
            return obj.name + ' - ' + obj.number;
        };

        $scope.searchCampaigns = function (searchTerm) {
          return $http.get('http://tunic.local/api/v1/campaign/', {
            params: {
              search: searchTerm
              // TODO: Ordering?
            },
            headers: {
              'Authorization': 'Token 246bce7a5ddaed1fd497ed9b53d0a2281e3928f5'
            }
          }).then($scope.campaignsRetrieved);
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: routes.COMPONENTS_URL + 'special-coverage/special-coverage-edit/special-coverage-edit.html'
    };
  });
