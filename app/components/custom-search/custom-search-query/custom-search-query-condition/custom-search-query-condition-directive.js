'use strict';

angular.module('customSearch.query.condition.directive', [
  'contentServices.factory',
  'customSearch.settings',
  'customSearch.service.condition.factory',
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest'
])
  .directive('customSearchQueryCondition', function (routes) {
    return {
      controller: function (_, $q, $scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
          BulbsAutocomplete, ContentFactory, CUSTOM_SEARCH_CONDITION_FIELDS,
          CUSTOM_SEARCH_CONDITION_TYPES) {

        $scope.conditionTypes = CUSTOM_SEARCH_CONDITION_TYPES;
        $scope.fieldTypes = CUSTOM_SEARCH_CONDITION_FIELDS;

        $scope.writables = {
          searchTerm: ''
        };

        $scope.autocompleteItems = [];

        var getAutocompleteItems = function () {
          return ContentFactory.all($scope.model.field)
            .getList({search: $scope.writables.searchTerm})
            .then(function (items) {
              var field = _.find($scope.fieldTypes, function (type) {
                return type.endpoint === $scope.model.field;
              });

              return _.map(items, function (item) {
                return {
                  name: item[field.value_structure.name],
                  value: item[field.value_structure.value]
                };
              });
            });
        };

        var autocomplete = new BulbsAutocomplete(getAutocompleteItems);

        $scope.updateAutocomplete = function () {
          if ($scope.writables.searchTerm) {
            autocomplete.$retrieve().then(function (results) {
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
        model: '=',
        onUpdate: '&',
        remove: '&'
      },
      templateUrl: routes.COMPONENTS_URL + 'custom-search/custom-search-query/custom-search-query-condition/custom-search-query-condition.html'
    };
  });
