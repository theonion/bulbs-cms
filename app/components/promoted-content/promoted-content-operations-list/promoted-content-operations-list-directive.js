'use strict';

angular.module('promotedContentOperationsList.directive', [
  'bulbsCmsApp.settings',
  'promotedContentOperationsList.controller'
])
  .directive('promotedContentOperationsList', function (_, moment, routes) {
    return {
      controller: 'PromotedContentOperationsList',
      link: function (scope, element, attr) {

        var aggregator = function () {
          var tempAggregate = scope.pzoneData.operations.concat(scope.pzoneData.unsavedOperations);

          scope.aggregatedOperations = _.sortBy(tempAggregate, function (operation) {
            var compTime = 0;
            if (operation.whenAsMoment) {
              // has a time, use that
              compTime = operation.whenAsMoment.valueOf();
            } else if (scope.pzoneData.previewTime){
              // has no time, but preview time is set, use that
              compTime = scope.pzoneData.previewTime;
            } else {
              // this is an immediate operation
              compTime = moment();
            }
            return compTime.valueOf();
          });
        };

        scope.$watchCollection('pzoneData.operations', aggregator);
        scope.$watchCollection('pzoneData.unsavedOperations', aggregator);

      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-operations-list/promoted-content-operations-list.html'
    };
  });
