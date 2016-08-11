'use strict';

angular.module('statusFilter.directive', [
  'bulbs.cms.site.config',
  'contentServices.listService',
  'statusFilter.config'
])
  .directive('statusFilter', function ($location, _, StatusFilterOptions, ContentListService, CmsConfig) {
    return {
      templateUrl: CmsConfig.buildComponentPath('status-filter/status-filter.html'),
      restrict: 'E',
      scope: {},
      controller: 'ContentlistCtrl',
      link: function postLink(scope, element, attrs) {
        scope.options = StatusFilterOptions.getStatuses();

        /**
         * Test if a particular option is currently active by comparing it to
         *  $location.search().
         *
         * @param {object} option - option parameters to test for.
         * @returns true if option is in $location.search, false otherwise.
         */
        scope.isActive = function (option) {
          if (option.key && option.key in $location.search() &&
              $location.search()[option.key] === getValue(option)) {
            return true;
          } else if (!option.key) { //all
            var possibleKeys = _.pluck(scope.options, 'key');
            var searchKeys = _.keys($location.search());
            if (_.intersection(possibleKeys, searchKeys).length > 0) {
              return false;
            } else {
              return true;
            }
          }
          return false;
        };

        scope.filterByStatus = function (option) {
          var search = {};
          var value;
          if (option.key) {
            value = getValue(option);
            search[option.key] = value;
          }

          return ContentListService.$updateContent(search, false);
        };

        function getValue(option) {
          var value;
          if (typeof option.value === 'function') {
            value = option.value();
          } else {
            value = option.value;
          }
          return value;
        }

      }
    };
  });
