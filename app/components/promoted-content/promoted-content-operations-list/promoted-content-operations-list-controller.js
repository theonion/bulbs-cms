'use strict';

angular.module('promotedContentOperationsList.controller', [
  'promotedContent.service'
])
  .controller('PromotedContentOperationsList', function (moment, $scope, PromotedContentService) {

    $scope.pzoneData = PromotedContentService.getData();
    $scope.scheduleDateFrom = moment();
    $scope.scheduleDateTo = moment().add(3, 'days');
    $scope.deleteStatus = {
      message: '',
      isError: false
    };

    PromotedContentService.$ready()
      .then(function () {
        $scope.aggregatedOperations = $scope.pzoneData.operations.concat($scope.pzoneData.unsavedOperations);
      });

    $scope.removeOperation = function (operation) {
      PromotedContentService.$removeOperation(operation.id)
        .then(function () {
          $scope.deleteStatus = {
            message: 'Operation successfully removed!',
            isError: false
          };
        })
        .catch(function (err) {
          $scope.deleteStatus = {
            message: err,
            isError: true
          };
        });
    };

    $scope.clearDeleteStatus = function () {
      $scope.deleteStatus.message = '';
    };

    $scope.setPreviewTime = function (time) {
      PromotedContentService.setPreviewTime(time);
    };
  });
