'use strict';

angular.module('BulbsAutocomplete.suggest.groupBy.directive', [])
  .directive('bulbsAutocompleteSuggestGroupBy', ['BULBS_AUTOCOMPLETE_EVENT_KEYPRESS', function (BULBS_AUTOCOMPLETE_EVENT_KEYPRESS) {
    return {
      restrict: 'E',
      templateUrl: 'src/bulbs-autocomplete-suggest/bulbs-autocomplete-suggest-group-by/bulbs-autocomplete-suggest-group-by.html',
      scope: {
        formatter: '&',
        grouper: '=',
        items: '=',
        onSelect: '&'
      },
      link: function (scope) {
        scope.$watch('items', function (newItemsValue) {
          scope.groupedItems = _.chain(scope.grouper(newItemsValue)).mapValues(function (group) {
              return group;
            })
            .pairs()
            .value();
        });
        scope.selectedGroupIndex = -1;
        scope.selectedIndex = -1;
        scope.$on(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, function (event, keyEvent) {
          if (!_.isEmpty(scope.groupedItems)) {
            var lastIndexOfGroups = scope.groupedItems.length - 1;

            if (lastIndexOfGroups < scope.selectedGroupIndex) {
              scope.selectedGroupIndex = -1;
              scope.selectedIndex = -1;
            }

            var items;
            var lastIndexOfItems;
            switch (keyEvent.keyCode) {
              case 13:
                // enter
                if (scope.selectedGroupIndex !== -1 && scope.selectedIndex !== -1) {
                  items = scope.groupedItems[scope.selectedGroupIndex][1];
                  scope.onSelect({
                    selection: items[scope.selectedIndex]
                  });
                }
                break;
              case 38:
                // up
                if (scope.selectedGroupIndex === -1) {
                  scope.selectedGroupIndex = lastIndexOfGroups;
                }

                items = scope.groupedItems[scope.selectedGroupIndex][1];
                lastIndexOfItems = items.length - 1;

                if (scope.selectedGroupIndex === 0 && scope.selectedIndex === 0) {
                  scope.selectedGroupIndex = lastIndexOfGroups;
                  scope.selectedIndex = scope.groupedItems[scope.selectedGroupIndex][1].length - 1;
                } else if (scope.selectedIndex === 0) {
                  scope.selectedGroupIndex--;
                  scope.selectedIndex = scope.groupedItems[scope.selectedGroupIndex][1].length - 1;
                } else {
                  scope.selectedIndex = scope.selectedIndex <= 0 ? lastIndexOfItems : scope.selectedIndex - 1;
                }

                break;
              case 40:
                // down
                if (scope.selectedGroupIndex === -1) {
                  scope.selectedGroupIndex = 0;
                }

                items = scope.groupedItems[scope.selectedGroupIndex][1];
                lastIndexOfItems = items.length - 1;

                if (scope.selectedGroupIndex === lastIndexOfGroups && scope.selectedIndex === lastIndexOfItems) {
                  scope.selectedGroupIndex = 0;
                  scope.selectedIndex = 0;
                } else if (scope.selectedIndex === lastIndexOfItems) {
                  scope.selectedGroupIndex++;
                  scope.selectedIndex = 0;
                } else {
                  scope.selectedIndex = scope.selectedIndex >= lastIndexOfItems ? 0 : scope.selectedIndex + 1;
                }
                break;
            }
          }
        });
      }
    };
  }]);
