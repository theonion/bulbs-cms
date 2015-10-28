'use strict';

angular.module('campaigns.edit.sponsorPixel.directive', [
  'bulbsCmsApp.settings'
])
  .constant('PIXEL_TYPES', [
    {
      name: 'Listing',
      value: 'Listing'
    },
    {
      name: 'Detail',
      value: 'Detail'
    }
  ])
  .directive('campaignsEditSponsorPixel', function (COMPONENTS_URL) {
    return {
      controller: function($scope, PIXEL_TYPES) {
        $scope.PIXEL_TYPES = PIXEL_TYPES;
      },
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: COMPONENTS_URL + 'campaigns/campaigns-edit/campaigns-edit-sponsor-pixel/campaigns-edit-sponsor-pixel.html'
    };
  });
