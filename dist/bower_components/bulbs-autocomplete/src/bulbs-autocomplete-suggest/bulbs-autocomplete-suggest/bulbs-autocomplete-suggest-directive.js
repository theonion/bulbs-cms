'use strict';
angular.module('BulbsAutocomplete.suggest.directive', [])
  .directive('bulbsAutocompleteSuggest', ['BULBS_AUTOCOMPLETE_EVENT_KEYPRESS', function (BULBS_AUTOCOMPLETE_EVENT_KEYPRESS) {
    return {
      restrict: 'E',
      templateUrl: 'src/bulbs-autocomplete-suggest/bulbs-autocomplete-suggest/bulbs-autocomplete-suggest.html',
      scope: {
        formatter: '&',
        items: '=',
        onSelect: '&'
      },
      link: function (scope) {
        scope.selectedIndex = -1;
        scope.$on(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, function (event, keyEvent) {
          if (scope.items) {
            var lastIndexOfItems = scope.items.length - 1;
            switch (keyEvent.keyCode) {
              case 13:
                // enter
                if (scope.selectedIndex !== -1) {
                  scope.onSelect({
                    selection: scope.items[scope.selectedIndex]
                  });
                }
                break;
              case 38:
                // up
                scope.selectedIndex = scope.selectedIndex <= 0 ? lastIndexOfItems : scope.selectedIndex - 1;
                break;
              case 40:
                //Down
                scope.selectedIndex = scope.selectedIndex >= lastIndexOfItems ? 0 : scope.selectedIndex + 1;
                break;
            }
          }
        });
      }
    };
  }]);
