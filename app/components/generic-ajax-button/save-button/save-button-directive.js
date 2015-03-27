'use strict';

angular.module('saveButton.directive', [
  'genericAjaxButton'
])
  .directive('saveButton', function (routes) {
    return {
      controller: 'GenericAjaxButtonController',
      link: {
        pre: function (scope) {
          scope.cssIconComplete = 'glyphicon-floppy-disk';
          scope.textProgress = 'Saving...';
          scope.textComplete = 'Save';
        }
      },
      restrict: 'E',
      scope: {
        disableWhen: '&',
        clickFunction: '=',
      },
      templateUrl: routes.COMPONENTS_URL + 'generic-ajax-button/generic-ajax-button.html'
    };
  });
