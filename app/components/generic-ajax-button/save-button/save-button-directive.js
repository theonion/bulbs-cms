'use strict';

angular.module('saveButton.directive', [
  'bulbs.cms.site.config',
  'genericAjaxButton'
])
  .directive('saveButton', function (CmsConfig) {
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
      templateUrl: CmsConfig.buildComponentPath('generic-ajax-button/generic-ajax-button.html')
    };
  });
