'use strict';

angular.module('filterListWidget.directive', [
  'bulbsCmsApp.settings',
  'lodash',
  'utils'
])
  .directive('filterListWidget', [
    '_', '$http', '$location', '$timeout', '$', 'COMPONENTS_URL', 'Utils',
    function (_, $http, $location, $timeout, $, COMPONENTS_URL, Utils) {
      return {
        restrict: 'E',
        scope: {
          filters: '='
        },
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'filter-list-widget',
          'filter-list-widget.html'
        ),
        link: function (scope, element, attrs) {
          var $element = $(element);
          var $input = $element.find('input');

          scope.autocompleteArray = [];

          var filterInputCounter = 0, filterInputTimeout;

          $input.on('input', function (e) {
            var search = $input.val();
            scope.searchTerm = search;

            $timeout.cancel(filterInputTimeout);
            filterInputTimeout = $timeout(function () { getAutocompletes(search); }, 200);

            if (filterInputCounter > 2) {
              getAutocompletes(search);
            }
          });
          function getAutocompletes(search) {
            $timeout.cancel(filterInputTimeout);
            filterInputCounter = 0;
            if (search.length < 1) {
              scope.autocompleteArray = [];
              scope.$apply();
              return;
            }

            $http({
              url: '/cms/api/v1/things/?type=tag&type=feature_type&type=author',
              method: 'GET',
              params: {'q': search}
            }).success(function (data) {
              scope.autocompleteArray = data;
            });
          }

          $input.on('keyup', function (e) {
            if (e.keyCode === 38) { arrowSelect('up'); }//up
            if (e.keyCode === 40) { arrowSelect('down'); } //down
            if (e.keyCode === 13) { //enter
              if ($element.find('.selected').length > 0) {
                // To trigger the click we need to first break out of the
                // current $apply() cycle. Hence the $timeout()
                $timeout(function () {
                  angular.element('.selected > a').triggerHandler('click');
                }, 0);
              } else {
                scope.addFilter('search', $input.val());
              }
            }
          });

          scope.search = function () {
            scope.addFilter('search', scope.filterInputValue);
          };

          scope.clearSearch = function () {
            scope.filterInputValue = '';
          };

          scope.clearFilters = function () {
            scope.filters = {};
            scope.filterInputValue = '';
            return applyFilterChange({});
          };

          $element.on('mouseover', '.entry', function () {
            scope.selectEntry(this);
          });

          function arrowSelect(direction) {
            var $entries = $element.find('.entry');
            var $selected = $element.find('.entry.selected');
            var $toSelect;
            if ($selected.length > 0) {
              if (direction === 'up') { $toSelect = $selected.first().prev(); }
              if (direction === 'down') { $toSelect = $selected.first().next(); }
            } else {
              if (direction === 'up') { $toSelect = $entries.last(); }
              if (direction === 'down') { $toSelect = $entries.first(); }
            }
            scope.selectEntry($toSelect);
          }
          scope.selectEntry = function (entry) {
            $element.find('.selected').removeClass('selected');
            $(entry).addClass('selected');
          };

          $input.on('blur', function () {
            $element.find('.dropdown-menu').fadeOut(200);
          });
          $input.on('focus', function () {
            $element.find('.dropdown-menu').fadeIn(200);
          });

          scope.addFilter = function (type, newFilterValue) {
            var filterObject = $location.search();
            if (type === 'search') {
              filterObject.search = newFilterValue;
            } else {
              if (!filterObject[type]) {
                filterObject[type] = [];
              }
              if (typeof(filterObject[type]) === 'string') {
                filterObject[type] = [filterObject[type]];
              }
              if (!_.contains(filterObject[type], newFilterValue)) {
                // this value is not already in
                filterObject[type].push(newFilterValue);
              }
            }
            return applyFilterChange(filterObject);
          };

          scope.deleteFilter = function (key) {
            var filterObject = $location.search();
            var toDelete = scope.filters[key];
            if (typeof(filterObject[toDelete.type]) === 'string') {
              filterObject[toDelete.type] = [filterObject[toDelete.type]];
            }
            var toSplice;
            for (var i in filterObject[toDelete.type]) {
              if (filterObject[toDelete.type][i] === toDelete.query) {
                toSplice = i;
                break;
              }
            }
            filterObject[toDelete.type].splice(i, 1);
            filterObject.search = $input.val();
            delete scope.filters[key];
            return applyFilterChange(filterObject);
          };

          function applyFilterChange(filterObject) {
            filterObject.page = 1;
            $location.search(filterObject);
            scope.autocompleteArray = [];
            $input.trigger('blur');
          }

          function getFilterObjects() {
            var search = $location.search();
            scope.filters = {};
            if (typeof(search) === 'undefined') { console.log('undefined'); return; }
            //TODO: this sucks
            var filterParamsToTypes = {'authors': 'author', 'tags': 'tag', 'feature_types': 'feature_type'};
            for (var filterParam in filterParamsToTypes) {
              var filterType = filterParamsToTypes[filterParam];
              if (typeof(search[filterParam]) === 'string') { search[filterParam] = [search[filterParam]]; }
              for (var i in search[filterParam]) {
                var value = search[filterParam][i];
                scope.filters[filterType + value] = {'query': value, 'type': filterParam};
                getQueryToLabelMappings(filterType, value);
              }
            }
            if (search.search) {
              scope.filterInputValue = search.search;
            }
          }

          scope.$on('$routeUpdate', function () {
            getFilterObjects();
          });

          getFilterObjects();

          function getQueryToLabelMappings(type, query) {
            //this is pretty stupid
            //TODO: Maybe do this with some localStorage caching?
            //TODO: Maybe just dont do this at all? I dont know if thats possible
            //    because there is no guarantee of any state (like if a user comes
            //    directly to a filtered search page via URL)
            scope.queryToLabelMappings = scope.queryToLabelMappings || {};

            if (query in scope.queryToLabelMappings) { return; }

            $http({
              url: '/cms/api/v1/things/?type=' + type,
              method: 'GET',
              params: {'q': query}
            }).success(function (data) {
              for (var i in data) {
                scope.queryToLabelMappings[data[i].value] = data[i].name;
              }
            });

          }

        }

      };
    }
  ]);
