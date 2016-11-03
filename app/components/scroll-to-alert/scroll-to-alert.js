'use strict';

angular.module('bulbs.cms.scrollToAlert', [
  'bulbs.cms.site.config',
  'jquery'
])
  .directive('scrollToAlert', [
    '$', 'CmsConfig',
    function ($, CmsConfig) {
      return {
        link: function (scope, element) {

          var page = $('html, body');
          var scrollEvents = 'scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove';
          var stopScroll = function () {
            page.stop();
          };

          scope.dismiss = function () {
            element.remove();
            page.off(scrollEvents, stopScroll);
          };

          scope.scrollTo = function () {
            page.animate({
              scrollTop: scope.newScrollTop()
            }, {
              start: function () {
                scope.dismiss();
                page.one(scrollEvents, stopScroll);
              }
            });
          };
        },
        restrict: 'E',
        scope: {
          label: '@',
          newScrollTop: '&',
        },
        templateUrl: CmsConfig.buildComponentPath(
          'scroll-to-alert',
          'scroll-to-alert.html'
        )
      };
    }
  ]);

