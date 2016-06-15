'use strict';

angular.module('bulbs.cms.components.createContent.types.default', [])
  .directive('createContentDefault', [
    'routes',
    function (routes) {
      return {
        restrict: 'E',
        // scope: {
        //   context: '&'
        // },
        templateUrl: routes.COMPONENTS_URL + 'create-content/create-content-default/create-content-default.html',
        link: function () {
          debugger;
        }
      };
    }
  ]);
