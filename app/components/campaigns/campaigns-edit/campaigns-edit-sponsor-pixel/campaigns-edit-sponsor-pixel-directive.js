'use strict';

angular.module('campaigns.edit.sponsorPixel.directive', [
]).constant('PIXEL_TYPES', [
    {
      name: 'Logo',
      value: 'Logo'
    },
    {
      name: 'Homepage',
      value: 'Homepage'
    }
  ])
  .directive('campaignsEditSponsorPixel', function (routes) {
    return {
      controller: function($scope, PIXEL_TYPES) {
        $scope.PIXEL_TYPES = PIXEL_TYPES;
      },
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: routes.COMPONENTS_URL + 'campaigns/campaigns-edit/campaigns-edit-sponsor-pixel/campaigns-edit-sponsor-pixel.html'
    };
  });
