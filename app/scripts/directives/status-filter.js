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
          if(option.key && option.key in $location.search()){
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
        };

        scope.filterByStatus = function (option) {
          var search = {}
          var value;
          if(option.key){
            if(typeof option.value == "function"){
              value = option.value();
            }else{
              value = option.value
            }
            search[option.key] = value;
          }
          $location.search(search);
        };

      }
    };
  });


/*

  <a class="btn btn-default" href="" ng-click="filterByStatus('draft');" ng-class="{ active: queue == 'draft' }" rel="keep-params">Draft</a>
  <a class="btn btn-default" ng-class="{ active: queue == 'waiting' }" rel="keep-params">Edit</a>
  <a class="btn btn-default" href="/cms/app/list/published/" ng-class="{ active: queue == 'published' }" rel="keep-params">Published</a>
  <a class="btn btn-default" href="/cms/app/list/scheduled/" ng-class="{ active: queue == 'scheduled' }" rel="keep-params">Scheduled</a>
  <a class="btn btn-default" href="/cms/app/list/all/" ng-class="{ active: queue == 'all' }" rel="keep-params">All</a></div>

*/