'use strict';

angular.module('saveButton.directive', [
  'genericAjaxButton'
])
  .directive('saveButton', function (COMPONENTS_URL) {
    return {
      controller: 'GenericAjaxButtonController',
      link: {
        pre: function (scope) {
          scope.cssIconComplete = 'fa-floppy-o';
          scope.textProgress = 'Saving...';
          scope.textComplete = 'Save';
        }
      },
      restrict: 'E',
      scope: {
        disableWhen: '&',
        clickFunction: '=',
      },
      templateUrl: COMPONENTS_URL + 'generic-ajax-button/generic-ajax-button.html'
    };
  });
