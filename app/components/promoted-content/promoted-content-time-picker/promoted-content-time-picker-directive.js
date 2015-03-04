'use strict';

angular.module('promotedContentTimePicker.directive', [
  'bulbsCmsApp.settings',
  'promotedContentTimePicker.controller'
])
  .directive('promotedContentTimePicker', function (_, $, moment, routes) {
    return {
      controller: 'PromotedContentTimePicker',
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-time-picker/promoted-content-time-picker.html'
    };
  });
