'use strict';

/**
 * Autocomplete directive that should cover most autocomplete situations.
 */
angular.module('autocompleteBasic', [
  'lodash',
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest',
  'bulbsCmsApp.settings'
])
  .value('AUTOCOMPLETE_BASIC_DEBOUNCE', 200)
  .directive('autocompleteBasic', [
    '_', 'routes',
    function (_, routes) {
      return {
        controller: [
          '$scope', 'BULBS_AUTOCOMPLETE_EVENT_KEYPRESS',
            'AUTOCOMPLETE_BASIC_DEBOUNCE',
          function ($scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
              AUTOCOMPLETE_BASIC_DEBOUNCE) {

            $scope.writables = {
              searchTerm: ''
            };

            $scope.autocompleteItems = [];

            var $getItems = function () {
              return $scope.searchFunction($scope.writables.searchTerm)
                .then(function (data) {
                  return _.map(data, function (item) {
                    return {
                      name: $scope.displayFormatter(item),
                      value: item
                    };
                  });
                });
            };

            $scope.updateAutocomplete = _.debounce(function () {
              if ($scope.writables.searchTerm) {
                $getItems().then(function (results) {
                  $scope.autocompleteItems = results;
                });
              }
            }, AUTOCOMPLETE_BASIC_DEBOUNCE);

            $scope.delayClearAutocomplete = function () {
              _.delay(function () {
                $scope.clearAutocomplete();
                $scope.$digest();
              }, 200);
            };

            $scope.clearAutocomplete = function () {
              $scope.writables.searchTerm = '';
              $scope.autocompleteItems = [];
            };

            $scope.clearSelectionOverlay = function () {
              $scope.clearAutocomplete();
              $scope.showSelectionOverlay = false;
              $scope.updateNgModel();
              $scope.onSelect({});
            };

            $scope.handleKeypress = function ($event) {
              if ($event.keyCode === 27) {
                // esc, close dropdown
                $scope.clearAutocomplete();
              } else if ($event.keyCode === 40 && _.isEmpty($scope.autocompleteItems)) {
                // down key and no items in autocomplete, redo search
                $scope.updateAutocomplete();
              } else {
                $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, $event);
              }
            };

            $scope.handleSelect = function (selection) {
              if (selection && $scope.updateNgModel) {
                $scope.updateNgModel(selection);
                $scope.showSelectionOverlay = true;
              }

              $scope.clearAutocomplete();
              $scope.onSelect({selection: selection});
            };
          }
        ],
        link: function (scope, iElement, iAttrs, ngModelCtrl) {
          var defaultFormatter = function (context) {
            return context.item;
          };

          scope.valueFormatter = function (viewValue) {
            return (scope.itemValueFormatter || defaultFormatter)({ item: viewValue });
          };

          scope.displayFormatter = function (modelValue) {
            return (scope.itemDisplayFormatter || defaultFormatter)({ item: modelValue });
          };

          if (ngModelCtrl) {

            ngModelCtrl.$formatters.push(function (modelValue) {
              return scope.displayFormatter(modelValue);
            });

            ngModelCtrl.$render = function () {
              scope.selectedValue = ngModelCtrl.$viewValue;
            };

            ngModelCtrl.$parsers.push(function (viewValue) {
              return scope.valueFormatter(viewValue);
            });

            var unbindInitialValue = scope.$watch('initialValue', function () {
              scope.selectedValue = scope.initialValue;
            });

            scope.updateNgModel = function (selection) {
              unbindInitialValue();
              var newValue = _.isUndefined(selection) ? null : angular.copy(selection.value);
              ngModelCtrl.$setViewValue(angular.copy(newValue));
              scope.selectedValue = scope.displayFormatter(newValue);
            };
          }
        },
        require: '?ngModel',          // optionally provide ng-model to have bind with an actual property
        restrict: 'E',
        scope: {
          hideSearchIcon: '&',        // true to hide search icon inside autocomplete
          inputId: '@',               // id to give input, useful if input has a label
          inputPlaceholder: '@',      // placeholder for input
          initialValue: '=',          // initial representation of selected value
          itemDisplayFormatter: '&',  // formatter to transform the display name of result
          itemValueFormatter: '&',    // formatter to transform the value of the result
          onSelect: '&',              // selection callback, recieves selection as argument
          searchFunction: '='         // function to use for searching autocomplete results
        },
        templateUrl: routes.COMPONENTS_URL + 'autocomplete-basic/autocomplete-basic.html'
      };
    }
  ]);
