'use strict';

angular.module('bulbsCmsApp')
  .provider('StatusFilterOptions', function () {
    var _statuses = [
      {label: 'Draft', key: 'status', value: 'draft'},
      {label: 'Published', key: 'before', value: function(){ return moment().format('YYYY-MM-DDTHH:mmZ')}},
      {label: 'Scheduled', key: 'after', value: function(){ return moment().format('YYYY-MM-DDTHH:mmZ')}},
      {label: 'All', key: null, value: null}
    ];

    this.setStatuses = function (statuses) {
      _statuses = statuses;
    }

    this.$get = function () {
      return {
        getStatuses: function () {
          return _statuses;
        }
      };
    };

  })
  .directive('statusFilter', function ($location, _, StatusFilterOptions, routes) {
    return {
      templateUrl: routes.PARTIALS_URL + 'status-filter.html',
      restrict: 'E',
      replace: true,
      controller: 'ContentlistCtrl',
      link: function postLink(scope, element, attrs) {
        scope.options = StatusFilterOptions.getStatuses();

        scope.isActive = function (option){
          if(option.key && option.key in $location.search() && $location.search()[option.key] == getValue(option)){
            return true;
          }
          if(!option.key){ //all
            var possibleKeys = _.pluck(scope.options, 'key');
            var searchKeys = _.keys($location.search());
            if(_.intersection(possibleKeys, searchKeys).length > 0){
              return false;
            }else{
              return true;
            }
          }
          return false;
        };

        scope.filterByStatus = function (option) {
          var search = {}
          var value;
          if(option.key){
            value = getValue(option);
            search[option.key] = value;
          }
          scope.getContent(search);
        };

        function getValue(option){
          var value;
          if(typeof option.value == "function"){
            value = option.value();
          }else{
            value = option.value
          }
          return value;
        }

      }
    };
  });