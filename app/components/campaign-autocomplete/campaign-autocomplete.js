'use strict';

angular.module('campaignAutocomplete', [
  'autocompleteBasic',
  'bulbs.cms.site.config',
  'cms.tunic.config',
  'lodash',
  'uuid4'
])
  .directive('campaignAutocomplete', [
    '$http', 'CmsConfig', 'TunicConfig', 'uuid4', '_',
    function ($http, CmsConfig, TunicConfig, uuid4, _) {
      return {
        controller: [
          '$scope',
          function ($scope) {

            $scope.itemDisplayFormatter = function (campaign) {
              if (_.isObject(campaign)) {
                return campaign.name + ' - ' + campaign.id;
              }
            };

            $scope.itemValueFormatter = function (campaign) {
              return _.isObject(campaign) ? campaign.id : null;
            };

            $scope.searchCampaigns = function (searchTerm) {
              return $http
                .get(TunicConfig.buildBackendApiUrl('campaign/'), {
                  params: { search: searchTerm }
                })
                  .then(function (response) {
                    return response.data.results;
                  });
            };
          }
        ],
        link: function (scope, iElement, iAttrs, ngModelCtrl) {
          scope.uuid = uuid4.generate();

          if (ngModelCtrl) {

            scope.ngModel = ngModelCtrl;

            ngModelCtrl.$render = function () {
              if (_.isNumber(ngModelCtrl.$modelValue) && !scope.initialValue) {
                $http
                  .get(TunicConfig.buildBackendApiUrl('campaign/' + ngModelCtrl.$modelValue + '/'))
                  .then(function (result) {
                    scope.initialValue = scope.itemDisplayFormatter(result.data);
                  });
              }
            };

            scope.onSelect = function (selection) {
              ngModelCtrl.$commitViewValue();
            };
          }
        },
        restrict: 'E',
        templateUrl: CmsConfig.buildComponentPath('campaign-autocomplete/campaign-autocomplete.html'),
        require: 'ngModel',
        scope: {
          label: '@campaignAutocompleteLabel',      // label for the autocomplete imput
          onSelect: '&campaignAutocompleteOnSelect' // selection handler for auto completions
        }
      };
    }
  ]);
