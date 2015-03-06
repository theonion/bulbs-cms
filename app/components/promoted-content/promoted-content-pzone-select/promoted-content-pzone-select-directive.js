'use strict';

angular.module('promotedContentPzoneSelect.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentPzoneSelect', function (routes) {
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
              .then(function () { PromotedContentService.$selectPZone(name); });
          })(name);
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-pzone-select/promoted-content-pzone-select.html'
    };
  });
