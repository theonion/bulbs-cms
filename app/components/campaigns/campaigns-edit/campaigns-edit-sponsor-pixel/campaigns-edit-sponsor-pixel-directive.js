'use strict';

angular.module('campaigns.edit.sponsorPixel.directive', [
  'bulbs.cms.config'
])
  .constant('PIXEL_TYPES', [{
    name: 'Listing',
    value: 'Listing'
  }, {
    name: 'Detail',
    value: 'Detail'
  }])
  .directive('campaignsEditSponsorPixel', function (CmsConfig) {
    return {
      controller: function($scope, PIXEL_TYPES) {
        $scope.PIXEL_TYPES = PIXEL_TYPES;
      },
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: CmsConfig.buildComponentPath('campaigns/campaigns-edit/campaigns-edit-sponsor-pixel/campaigns-edit-sponsor-pixel.html')
    };
  });
