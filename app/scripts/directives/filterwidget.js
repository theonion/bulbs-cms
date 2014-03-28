'use strict';

angular.module('bulbsCmsApp')
  .directive('filterwidget', function ($http, $location, $window, $timeout) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'filterwidget.html',
      link: function(scope, element, attrs){
        var $element = $(element);
        var $input = $element.find("input");
        scope.searchTerm;

        scope.autocompleteArray = new Array();

        var filterInputCounter = 0, filterInputTimeout;

        $input.on('input', function(e){
          var search = $input.val();
          scope.searchTerm = search;

          $timeout.cancel(filterInputTimeout);
          filterInputTimeout = $timeout(function(){ getAutocompletes(search); }, 200);

          if(filterInputCounter > 2){
            getAutocompletes(search);
          }
        });
        function getAutocompletes(search){
          $timeout.cancel(filterInputTimeout);
          filterInputCounter = 0;
          if(search.length < 1){
            scope.autocompleteArray = new Array();
            scope.$apply();
            return;
          }

          $http({
            url: '/cms/api/v1/things/?type=tag&type=feature_type&type=author',
            method: 'GET',
            params: {'q': search}
          }).success(function(data){
            scope.autocompleteArray = data;
          });
        }

        $input.on('keyup', function(e){
          if(e.keyCode == 38) arrowSelect('up'); //up
          if(e.keyCode == 40) arrowSelect('down'); //down
          if(e.keyCode == 13){ //enter
            if($element.find('.selected').length > 0) $element.find('.selected').click();
            else{
              scope.addFilter('search', $input.val());
            }
          }
        });

        $element.find('.search-button').on('click', function(e){
          scope.addFilter('search', $input.val());
        });

        $element.find('.clear-button').on('click', function(e){
          $(this).prev('input').val('');
          scope.filterObjects = {};
          applyFilterChange({});
        });

        $element.on('mouseover', '.entry', function(){
          scope.selectEntry(this);
        });

        function arrowSelect(direction){
          var $entries = $element.find('.entry')
          var $selected = $element.find('.entry.selected')
          var $toSelect;
          if($selected.length > 0){
            if(direction == 'up') $toSelect = $selected.first().prev();
            if(direction == 'down') $toSelect = $selected.first().next();
          }else{
            if(direction == 'up') $toSelect = $entries.last();
            if(direction == 'down') $toSelect = $entries.first();
          }
          scope.selectEntry($toSelect);
        }
        scope.selectEntry = function(entry){
          $element.find('.selected').removeClass('selected');
          $(entry).addClass('selected');
        }

        $input.on('blur', function(){
          $element.find('.dropdown-menu').fadeOut(200);
        });
        $input.on('focus', function(){
          $element.find('.dropdown-menu').fadeIn(200);
        });

        scope.addFilter = function(type, newFilterValue){
          var filterObject = $location.search();
          if(type == 'search'){
            filterObject['search'] = newFilterValue;
          }else{
            if(!filterObject[type]) filterObject[type] = [];
            if(typeof(filterObject[type]) === "string") filterObject[type] = [filterObject[type]];
            filterObject[type].push(newFilterValue);
            $input.val('');
          }
          applyFilterChange(filterObject);
          scope.filterInputValue = "";
        }

        scope.deleteFilter = function(key){
          var filterObject = $location.search();
          var toDelete = scope.filterObjects[key];
          if(typeof(filterObject[toDelete.type]) === "string") filterObject[type] = [filterObject[type]];
          var toSplice;
          for(var i in filterObject[toDelete.type]){
            if(filterObject[toDelete.type][i] == toDelete.query){
              toSplice = i;
              break;
            }
          }
          filterObject[toDelete.type].splice(i, 1);
          filterObject['search'] = $input.val();
          delete scope.filterObjects[key];
          applyFilterChange(filterObject);
        }

        function applyFilterChange(filterObject){
          filterObject.page = 1;
          $location.search(filterObject);
          scope.getContent();
          scope.autocompleteArray = new Array();
          $input.trigger('blur');
        }

        scope.$watch('locationSearch', function(search) {
          scope.filterObjects = {};
          if(typeof(search) === "undefined") return;
          //TODO: this sucks
          var filterParamsToTypes = {'authors': 'author', 'tags': 'tag', 'feature_types': 'feature_type'};
          for(var filterParam in filterParamsToTypes){
            var filterType = filterParamsToTypes[filterParam];
            if(typeof(search[filterParam]) === "string") search[filterParam] = [search[filterParam]];
            for(var i in search[filterParam]){
              var value = search[filterParam][i];
              scope.filterObjects[filterType + value] = {'query': value, 'type': filterParam};
              getQueryToLabelMappings(filterType, value);
            }
          }
          if(search.search){ scope.filterInputValue = search.search; }
        });
        scope.$on('$routeUpdate', function(){
          scope.locationSearch = $location.search();
        });
        scope.locationSearch = $location.search();

        function getQueryToLabelMappings(type, query){
          //this is pretty stupid
          //TODO: Maybe do this with some localStorage caching?
          //TODO: Maybe just dont do this at all? I dont know if thats possible
          //    because there is no guarantee of any state (like if a user comes
          //    directly to a filtered search page via URL)
          scope.queryToLabelMappings = scope.queryToLabelMappings || {};

          if(query in scope.queryToLabelMappings) return;

          $http({
            url: '/cms/api/v1/things/?type=' + type,
            method: 'GET',
            params: {'q': query}
          }).success(function(data){
            for(var i in data){
              scope.queryToLabelMappings[data[i].value] = data[i].name;
            }
          });

        }

      }

    };
  });
