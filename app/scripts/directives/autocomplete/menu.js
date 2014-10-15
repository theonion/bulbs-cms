'use strict';

angular.module('bulbsCmsApp')
  .directive('autocompleteMenu', function ($timeout, $animate, $compile, routes) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: angular.noop,
      scope: {
        items: '=items',
        pIndex: '=index',
        select: '&select',
      },
      link: function ($scope, element, attrs) {
        
        $scope.selectItem = function (index) {
          $scope.select(index);
        }

        $scope.setIndex = function (index) {
          $scope.index = index;

          if (attrs.index) {
            $scope.pIndex = parseInt(index, 10);
          }
        }

        if (attrs.index) {
          $scope.$watch('pIndex', function(value){
            $scope.index = parseInt(value, 10);
          })
        }

        $scope.label = function(index) {
          var viewValue = $scope.items[index][attrs.labelAttr];
          if (typeof(viewValue) === "function") {
            viewValue = viewValue();
          }
          return viewValue;
        }

      },
      template: '<ul class="autocomplete-menu" ng-show="items.length !== 0"><li ng-repeat="item in items" ng-click="select($index)" ng-class="{\'active\': $index == index}" ng-mouseenter = "setIndex($index)"><span>{{ label($index) }}</span></li></ul>'
    };
  });
