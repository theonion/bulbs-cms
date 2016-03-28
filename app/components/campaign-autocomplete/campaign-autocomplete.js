'use strict';

angular.module('campaignAutocomplete', [
  'autocompleteBasic',
  'cms.tunic.config',
  'uuid4'
])
  .directive('campaignAutocomplete', [
    'routes', 'uuid4',
    function (routes, uuid4) {
      return {
        controller: [
          '$http', '$scope', 'TunicConfig',
          function ($http, $scope, TunicConfig) {
            $scope.itemDisplayFormatter = function (campaign) {
              return campaign.name + ' - ' + campaign.number;
            };

            $scope.itemValueFormatter = function (campaign) {
              return campaign.number;
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
        link: function (scope) {
          scope.uuid = uuid4.generate();
        },
        restrict: 'E',
        templateUrl: routes.COMPONENTS_URL + 'campaign-autocomplete/campaign-autocomplete.html',
        require: 'ngModel',
        scope: {
          label: '@campaignAutocompleteLabel', // The label for the autocomplete imput
          onSelect: '&campaignAutocompleteOnSelect' // selection handler for auto completions
        }
      };
    }
  ]);
