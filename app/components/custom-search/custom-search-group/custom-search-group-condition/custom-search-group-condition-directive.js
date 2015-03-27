'use strict';

angular.module('customSearch.group.condition.directive', [
  'contentServices.factory',
  'customSearch.settings',
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest'
])
  .directive('customSearchGroupCondition', function (routes) {
    return {
      controller: function (_, $q, $scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
          ContentFactory, CUSTOM_SEARCH_CONDITION_FIELDS, CUSTOM_SEARCH_CONDITION_TYPES) {

        $scope.conditionTypes = CUSTOM_SEARCH_CONDITION_TYPES;
        $scope.fieldTypes = CUSTOM_SEARCH_CONDITION_FIELDS;

        $scope.writables = {
          searchTerm: ''
        };

        $scope.autocompleteItems = [];

        $scope.data = $scope.controllerService.groupsConditionsGet($scope.groupIndex, $scope.conditionIndex);

        var $getItems = function () {
          return ContentFactory.all($scope.data.field)
            .getList({search: $scope.writables.searchTerm})
            .then(function (items) {
              var field = _.find($scope.fieldTypes, function (type) {
                return type.endpoint === $scope.data.field;
              });

              return _.map(items, function (item) {
                return {
                  name: item[field.value_structure.name],
                  value: item[field.value_structure.value]
                };
              });
            });
        };

        $scope.updateAutocomplete = function () {
          if ($scope.writables.searchTerm) {
            $getItems().then(function (results) {
              $scope.autocompleteItems = results;
            });
          }
        };

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

        $scope.handleKeypress = function ($event) {
          if ($event.keyCode === 27) {
            // esc, close dropdown
            $scope.clearAutocomplete();
          } else {
            $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, $event);
          }
        };
      },
      restrict: 'E',
      scope: {
        controllerService: '=',
        groupIndex: '=',
        conditionIndex: '=',
        onUpdate: '&',
        remove: '&'
      },
      templateUrl: routes.COMPONENTS_URL + 'custom-search/custom-search-group/custom-search-group-condition/custom-search-group-condition.html'
    };
  });
