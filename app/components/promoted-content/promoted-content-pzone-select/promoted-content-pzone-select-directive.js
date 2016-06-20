'use strict';

angular.module('promotedContentPzoneSelect.directive', [
  'bulbs.cms.site.config',
  'promotedContent.service'
])
  .directive('promotedContentPzoneSelect', function (CmsConfig) {
    return {
      controller: function ($scope, PromotedContentService) {

        $scope.pzoneData = PromotedContentService.getData();
        $scope.selectedPZoneName = '';

        PromotedContentService.$ready()
          .then(function () {
            $scope.selectedPZoneName = $scope.pzoneData.selectedPZone.name;
          });

        $scope.changePZone = function (name) {
          (function (name) {
            PromotedContentService.$refreshPZones()
              .then(function () {
                PromotedContentService.$selectPZone(name);
              });
          })(name);
        };

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: CmsConfig.buildComponentPath('promoted-content/promoted-content-pzone-select/promoted-content-pzone-select.html')
    };
  });
