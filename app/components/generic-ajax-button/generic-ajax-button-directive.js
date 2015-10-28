'use strict';

/**
 * Highly customizable four state ajax button. Useful for buttons which require
 *  different displays for disabled/action/progress/complete states.
 */
angular.module('genericAjaxButton.directive', [
  'bulbsCmsApp.settings',
  'genericAjaxButton.controller'
])
  .directive('genericAjaxButton', function (COMPONENTS_URL) {
    return {
      controller: 'GenericAjaxButtonController',
      restrict: 'E',
      scope: {
        disableWhen: '&',
        clickFunction: '=',
        cssBtnClassComplete: '@',
        cssBtnClassError: '@',
        cssBtnClasses: '@',
        cssBtnClassProgress: '@',
        cssIconComplete: '@',
        textError: '@',
        textProgress: '@',
        textComplete: '@'
      },
      templateUrl: COMPONENTS_URL + 'generic-ajax-button/generic-ajax-button.html'
    };
  });
