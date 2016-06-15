'use strict';

angular.module('customSearch.simpleContentSearch.directive', [
  'bulbs.cms.site.config',
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest'
])
  .directive('customSearchSimpleContentSearch', function (CmsConfig) {
    return {
      controller: function (_, $scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
          ContentFactory) {

        $scope.writables = {
          searchTerm: ''
        };

        $scope.autocompleteItems = [];

        var $getItems = function () {
          return ContentFactory.all('content')
            .getList({search: $scope.writables.searchTerm})
            .then(function (results) {
              return _.chain(results)
                .take(10)
                .map(function (item) {
                  return {
                    name: 'ID: ' + item.id + ' | ' + item.title,
                    value: item.id
                  };
                })
                .value();
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
        onSelect: '&'
      },
      templateUrl: CmsConfig.buildComponentPath('custom-search/custom-search-simple-content-search/custom-search-simple-content-search.html')
    };
  });
