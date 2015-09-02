'use strict';

/**
 * Autocomplete directive that should cover most autocomplete situations.
 */
angular.module('autocompleteBasic', [
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest',
  'bulbsCmsApp.settings'
])
  .value('AUTOCOMPLETE_BASIC_DEBOUNCE', 200)
  .directive('autocompleteBasic', function (COMPONENTS_URL) {
    return {
      controller: function (_, $scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, AUTOCOMPLETE_BASIC_DEBOUNCE) {

        $scope.writables = {
          searchTerm: ''
        };

        $scope.currentSelection = null;
        $scope.autocompleteItems = [];

        var $getItems = function () {
          return $scope.searchFunction($scope.writables.searchTerm)
            .then(function (data) {
              return _.map(data, function (item) {
                return {
                  name: $scope.itemDisplayFormatter({item: item}),
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
          $scope.updateNgModel(null);
          $scope.onSelect({selection: null});
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
          if (!selection && $scope.allowInputValueSelection()) {
            selection = {
              name: $scope.writables.searchTerm,
              value: $scope.writables.searchTerm
            };
          }

          if ($scope.updateNgModel) {
            $scope.updateNgModel(selection);
            $scope.showSelectionOverlay = true;
          }

          $scope.clearAutocomplete();
          $scope.onSelect({selection: selection});
        };
      },
      link: function (scope, iElement, iAttrs, ngModelCtrl) {
        if (ngModelCtrl) {
          ngModelCtrl.$formatters.push(function (modelValue) {
            scope.currentSelection = modelValue;
            return modelValue;
          });

          ngModelCtrl.$parsers.push(function (viewValue) {
            scope.currentSelection = viewValue;
            return viewValue;
          });

          scope.updateNgModel = function (selection) {
            var newViewValue = null;
            if (selection && selection.value) {
              newViewValue = selection.value;
            }
            ngModelCtrl.$setViewValue(newViewValue);
          };
        }
      },
      require: '?ngModel',            // optionally provide ng-model to have bind directly with a property
      restrict: 'E',
      scope: {
        hideSearchIcon: '&',          // true to hide search icon inside autocomplete
        inputId: '@',                 // id to give input, useful if input has a label
        inputPlaceholder: '@',        // placeholder for input
        itemDisplayFormatter: '&',    // formatter to use for autocomplete results
        onSelect: '&',                // selection callback, recieves selection as argument
        searchFunction: '=',          // function to use for searching autocomplete results
        allowInputValueSelection: '&' // true to allow input to retain the value of the input even if that value hasn't been selected from results
      },
      templateUrl: COMPONENTS_URL + 'autocomplete-basic/autocomplete-basic.html'
    };
  });
