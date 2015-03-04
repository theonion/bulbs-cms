'use strict';

angular.module('customSearch.simpleContentSearch.directive', [
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest'
])
  .directive('customSearchSimpleContentSearch', function (routes) {
    return {
      controller: function (_, $scope, BulbsAutocomplete, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
          ContentFactory) {

        $scope.writables = {
          searchTerm: ''
        };

        $scope.autocompleteItems = [];

        var getAutocompleteItems = function () {
          return ContentFactory.all('content')
            .getList({search: $scope.writables.searchTerm})
            .then(function (results) {
              return _.map(results, function (item) {
                return {
                  name: 'ID: ' + item.id + ' | ' + item.title,
                  value: item.id
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
        onSelect: '&'
      },
      templateUrl: routes.COMPONENTS_URL + 'custom-search/custom-search-simple-content-search/custom-search-simple-content-search.html'
    };
  });
