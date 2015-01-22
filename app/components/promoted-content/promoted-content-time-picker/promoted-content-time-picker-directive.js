'use strict';

angular.module('promotedContentTimePicker.directive', [
  'bulbsCmsApp.settings',
  'promotedContentTimePicker.controller'
])
  .directive('promotedContentTimePicker', function (_, $, moment, routes) {
    return {
      controller: 'PromotedContentTimePicker',
      link: function (scope, element, attr) {
        var now = moment();
        var groupingFormat = 'YYYYMMDDHH';

        // check for changes to operations so we can group them by time for display
        scope.hours = [];
        scope.$watchGroup(['contentData.operations', 'previewTime'], function (newVals) {
          var newOperations = newVals[0];
          var timeForTimeline = scope.previewTime || moment();
          var previewHour = timeForTimeline.hour();
          var groupedOperations = _.groupBy(newOperations, function (operation) {
            return operation.whenAsMoment.format(groupingFormat);
          });
          scope.hours = [];
          _.each(_.range(previewHour, previewHour + 12), function (hour, i) {
            var format24 = hour % 24;
            var format12 = format24 % 12 || 12;
            var amPM = format24 < 12 ? 'a' : 'p';
            var preformat = '';
            var hourDate = timeForTimeline.clone().add(i, 'hours');
            var hourOps = groupedOperations[hourDate.format(groupingFormat)];

            if (hourOps) {
              // format tooltip html
              preformat += '<div class="tooltip-title">Operations ' + format12 + ':00' + amPM + 'm to ' + format12 + ':59' + amPM + 'm</div>';

              _.each(hourOps, function (operation) {
                preformat +=
                  '<div class="tooltip-operation">' +
                  operation.whenAsMoment.format(':mm') + ' ' +
                  operation.cleanType + ' ' +
                  operation.content_title +
                  '<div>';
              });
            }

            scope.hours.push({
              hour: format12,
              amPM: amPM,
              passed: hourDate.isBefore(now),
              current: hourDate.isSame(now, 'hour'),
              operations: hourOps,
              preformat: preformat
            });
          });
        });
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-time-picker/promoted-content-time-picker.html'
    };
  });
