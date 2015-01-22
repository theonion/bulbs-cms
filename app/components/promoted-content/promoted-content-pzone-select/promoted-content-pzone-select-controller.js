'use strict';

angular.module('promotedContentPzoneSelect.controller', [
  'promotedContent.service'
])
  .controller('PromotedContentPzoneSelect', function ($scope, PromotedContentService) {

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

  });
