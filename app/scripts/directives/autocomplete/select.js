'use strict';

angular.module('bulbsCmsApp')
  .directive('autocomplete', function ($timeout, $animate, $compile, routes) {
    return {
      restrict: 'E',
      replace: true,
      require: 'ngModel',
      transclude: true,
      controller: function ($scope, $element, $attrs, $injector) {
        $scope.service = $injector.get($attrs.service);
        $scope.placeholder = $attrs.placeholder || '';
      },
      link: function ($scope, element, attrs, ngModel, transclude) {

        var isMenuAppended = false;
        var inputEl = element.find('input');
        var timeoutId = null;

        ngModel.$render = function() {
          if (ngModel.$viewValue) {
            var viewValue = ngModel.$viewValue[attrs.labelAttr];
            if (typeof(viewValue) === "function") {
              viewValue = viewValue();
            }
            element.find('input').val(viewValue);
            inputEl.attr('disabled', 'disabled');
          }
        }

        $scope.openMenu = function(e) {
          inputEl.removeAttr('disabled');
          inputEl[0].focus();
        }

        inputEl.on('blur keyup change', function() {
          if (inputEl.attr('disabled') !== undefined) {
            return;
          }
          appendMenu();
          var value = inputEl.val();
          if (value) {
            if (timeoutId) {
              $timeout.cancel(timeoutId);
            }
            timeoutId = $timeout(function(){ queryData(value)}, 150);
          }
        });

        var menuScope = $scope.$new();
        menuScope.items = [];
        menuScope.index = 0;
        menuScope.select = function(index) {
          ngModel.$setViewValue(menuScope.items[index]);
          reset();
        }

        var menuEl = angular.element(document.createElement('autocomplete-menu'));
        menuEl.attr({
          'items': 'items',
          'select': 'select(index)',
          'index': 'index',
          'label-attr': attrs.labelAttr,
        });
        transclude(menuScope, function(clone){ menuEl.append(clone) });
        $compile(menuEl)(menuScope);

        element.find('input').on('keyup', function(e) {
          switch(e.which) {
            case 27: // ESC
              if (inputEl.val() === '') {
                reset();
              } else {
                inputEl.val('');
              }
              break;
            case 40: // DOWN
              $scope.$apply(function() {
                menuScope.index = (menuScope.index + 1) % menuScope.items.length;
              });
              break;
            case 38: // UP
              $scope.$apply(function() {
                if(menuScope.index) {
                  menuScope.index = menuScope.index - 1;
                } else {
                  menuScope.index = menuScope.items.length - 1;
                }
              });
              break;
            case 13: // RETURN
              if (menuScope.index >= 0) {
                ngModel.$setViewValue(menuScope.items[menuScope.index]);
                reset();
              }
              break;
            default:
              return;
          }
        });

        function queryData(query) {
          var searchParams = {}
          searchParams[attrs.searchParam || 'search'] = query;
          $scope['service'].getList(searchParams).then(function (results) {

            if(results.length > 5) {
              menuScope.items = results.slice(0, 5);
            } else {
              menuScope.items = results;
            }
            timeoutId = null;
          });
        }

        function appendMenu() {
          if (!isMenuAppended) {
            isMenuAppended = true;
            menuScope.index = 0;
            $animate.enter(menuEl, element.parent(), element);
          }
          styleMenu();
        }

        function reset() {
          ngModel.$render();
          menuScope.items = [];
          menuScope.index = 0;
          $animate.leave(menuEl).finally(function() {
            isMenuAppended = false;
          });
        }

        function styleMenu() {
          var parentStyles = window.getComputedStyle(element[0]);
          var offset = element.offset();

          offset.left = 'auto';
          offset.right = 'auto';
          offset.top = element.outerHeight();
          offset.minWidth = element.outerWidth();

          angular.forEach(offset, function (value, key) {
            if (!isNaN(value) && angular.isNumber(value)) {
              value = value + "px"
            }
            menuEl[0].style[key] = value;
            menuEl.css('z-index', 1000);
          });
        }
      },
      templateUrl: routes.PARTIALS_URL + 'autocomplete.html'
    };
  });
