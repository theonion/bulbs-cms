'use strict';

angular.module('bulbsCmsApp.nonRestmodListPage', [
  'bulbs.cms.site.config',
  'confirmationModal',
  'copyButton',
  'lodash',
  'bulbs.cms.utils'
])
  .directive('nonRestmodListPage', function (CmsConfig) {
    return {
      controller: function (_, $scope, $location, $parse, Utils) {

        $scope.pathJoin = Utils.path.join;

        // different types of filters that get combined to make seach query params
        $scope.orderingFilter = {};
        $scope.searchFilter = {};
        $scope.toggledFilters = {};
        $scope.pageNumber = 1;

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
          return $scope.getItems({params: allParams})
            .then(function (response) {
              $scope.items = response.results;
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
          $scope.pageNumber = 1;

          $scope.$retrieve();
        };

        // toggled filters, only one set of these can be applied at a time
        $scope.filterButtonsParsed = $scope.filterButtons();
        $scope.$toggleFilters = function (params) {
          $scope.toggledFilters = params;

          // go to page 1, new results may not have more than 1 page
          $scope.pageNumber = 1;

          $scope.$retrieve();
        };

        // sorting functionality, only one field can be sorted at a time
        $scope.sortingField = null;
        $scope.sortDirection = 'asc';
        $scope.$sort = function (fieldName) {
          var direction;
          if (fieldName === $scope.sortingField) {
            // clicked on same field, make direction opposite of what it is now
            direction = $scope.sortDirection === 'desc' ? '' : '-';
          } else {
            // clicked on a different field, start with the opposite of default
            direction = '-';
          }

          // do ordering request
          $scope.orderingFilter = {ordering: direction + fieldName};
          $scope.$retrieve($scope.orderingFilter.ordering)
            .then(function () {
              $scope.sortingField = fieldName;
              $scope.sortDirection = direction === '-' ? 'desc' : 'asc';
            });
        };

        $scope.cellContents = function (item, field) {
          var cellContents = '-';

          if (_.isFunction(field.content)) {
            cellContents = field.content(item);
          } else if (_.isString(field.content)) {
            cellContents = item[field.content];
          } else if (field.sorts) {
            cellContents = item[field.sorts];
          }
          return cellContents;
        };

        $scope.$add = function () {
          $location.path($scope.cmsEditPageUrl({ item: { id: 'new' } }));
        };

        $scope.$remove = function (removedItem) {
          $scope.destroyItem({item: removedItem});
          _.remove($scope.items, function(item) {
            return item === removedItem;
          });
        };

        $scope.goToEditPage = function (item) {
          $location.path($scope.cmsEditPageUrl({ item: item }));
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
        cmsEditPageUrl: '&',  // url to edit page, will be postfixed with id or 'new'
        destroyItem: '&',     // returns promise, deletes given item
        getItems: '&',        // function returns promise, recieves search params
        filterButtons: '&',   // settings for filter buttons
                              // { title:'human readable', active:true, params:queryParams object }
        modelFields: '&',     // list of objects { sorts: x, title: y}
        modelName: '&',       // list page title
        modelNamePlural: '&', // list page title pluralized
        searchParameter: '@', // key for text search param
        toolCopyContent: '@', // content to copy with copy buttons, where `record` is the record being copied, leave empty to hide copy button
      },
      templateUrl: CmsConfig.buildSharedPath('non-restmod-list-page/non-restmod-list-page.html')
    };
  });
