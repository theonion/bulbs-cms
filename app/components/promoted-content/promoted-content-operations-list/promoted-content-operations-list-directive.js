'use strict';

angular.module('promotedContentOperationsList.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentOperationsList', function (_, moment, routes) {
    return {
      controller: function (moment, $scope, PromotedContentService) {

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
          // set preview time to time plus a minute so that all operations occuring in that
          //  minute can be previewed
          PromotedContentService.setPreviewTime(time.add(1, 'minute'));
        };
      },
      link: function (scope, element, attr) {

        var operationTime = function (operation) {
          var compTime;
          if (operation.whenAsMoment) {
            // has a time, use that
            compTime = operation.whenAsMoment;
          } else if (scope.pzoneData.previewTime){
            // has no time, but preview time is set, use that
            compTime = scope.pzoneData.previewTime;
          } else {
            // this is an immediate operation
            compTime = moment();
          }
          return compTime;
        };

        scope.aggregatedOperations = {};
        scope.groupDateFormat = 'M/D/YY @ h:mma';
        var aggregator = function () {
          var tempAggregate = scope.pzoneData.operations.concat(scope.pzoneData.unsavedOperations);

          scope.aggregatedOperations = _.chain(tempAggregate)
            .sortBy(operationTime)
            .groupBy(function (operation) {
              return operationTime(operation).format(scope.groupDateFormat);
            })
            .pairs()
            .map(function (pair) {
              return [moment(pair[0], scope.groupDateFormat), pair[1]];
            })
            .sortBy(function (pair) {
              return pair[0];
            })
            .value();
        };

        scope.$watchCollection('pzoneData.operations', aggregator);
        scope.$watchCollection('pzoneData.unsavedOperations', aggregator);

      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-operations-list/promoted-content-operations-list.html'
    };
  });
