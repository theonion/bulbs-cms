'use strict';

angular.module('listPage', [
  'bulbsCmsApp.settings',
  'confirmationModal',
  'copyButton',
  'lodash'
])
  .directive('listPage', function (routes) {
    return {
      controller: function (_, $scope, $location, $parse) {
        $scope.name = $scope.modelFactory.identity();
        $scope.namePlural = $scope.modelFactory.identity(true);
        $scope.fields = $scope.modelFactory.$fieldDisplays();
        $scope.$list = $scope.modelFactory.$collection();

        // different types of filters that get combined to make seach query params
        $scope.orderingFilter = {};
        $scope.searchFilter = {};
        $scope.toggledFilters = {};

        $scope.copyContentInContext = function (record) {
          var value = '';
          if ($scope.toolCopyContent) {
             value = $parse($scope.toolCopyContent)({record: record});
          }
          return value;
        };

        $scope.$retrieve = _.debounce(function (addParams) {
          $scope.loadingResults = true;
          var allParams = _.merge(
            {},
            $scope.orderingFilter,
            $scope.toggledFilters,
            $scope.searchFilter,
            addParams
          );
          return $scope.$list.$refresh(allParams)
            .$then(function () {
              $scope.loadingResults = false;
            });
        }, 250);

        // search functionality
        $scope.$search = function (query) {
          $scope.searchFilter = {};

          if (query) {
            $scope.searchFilter[$scope.searchParameter] = query;
          }

          // go to page 1, new results may not have more than 1 page
          $scope.$list.$page = 1;

          $scope.$retrieve();
        };

        // toggled filters, only one set of these can be applied at a time
        $scope.filterButtonsParsed = $scope.filterButtons();
        $scope.$toggleFilters = function (params) {
          $scope.toggledFilters = params;

          // go to page 1, new results may not have more than 1 page
          $scope.$list.$page = 1;

          $scope.$retrieve();
        };

        // sorting functionality, only one field can be sorted at a time
        $scope.sortingField = null;
        $scope.sortDirection = 'asc';
        $scope.$sort = function (field) {
          var direction;
          if (field.title === $scope.sortingField) {
            // clicked on same field, make direction opposite of what it is now
            direction = $scope.sortDirection === 'desc' ? 'asc' : 'desc';
          } else {
            // clicked on a different field, start with the opposite of default
            direction = 'desc';
          }

          // do ordering request
          (function (field, direction) {
            $scope.orderingFilter = {ordering: field.getOrdering(direction)};
            $scope.$retrieve()
              .$then(function () {
                $scope.sortingField = field.title;
                $scope.sortDirection = direction;
              });
          })(field, direction);
        };

        $scope.$add = function () {
          $location.path('/cms/app/' + $scope.cmsPage + '/edit/new/');
        };

        $scope.$remove = function (item) {
          item.$destroy();
        };

        $scope.goToEditPage = function (item) {
          $location.path('/cms/app/' + $scope.cmsPage + '/edit/' + item.id + '/');
        };

        // set the active filter, either the first button with active === true,
        //   or empty string for all
        $scope.activeFilterButton =
          _.chain($scope.filterButtonsParsed)
            .findWhere({active: true})
            .tap(function (button) {
              // cheat here and set the params for the first retrieve
              if (button) {
                $scope.toggledFilters = button.params;
              }
            })
            .result('title')
            .value() ||
            '';
        // do initial retrieval
        $scope.$retrieve();
      },
      restrict: 'E',
      scope: {
        cmsPage: '@',
        filterButtons: '&',
        modelFactory: '=',
        searchParameter: '@',
        toolCopyContent: '@'
      },
      templateUrl: routes.SHARED_URL + 'list-page/list-page.html'
    };
  });
