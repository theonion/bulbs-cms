'use strict';

angular.module('bulbsCmsApp')
  .directive('mediaRating', function ($http, $, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'rating.html',
      scope: true,
      controller: function ($scope) {
        $scope.search = function (el) {
          $scope.searchTimeout = null;
          var inputs = el.find('.media-field input');
          var searchParams = {};
          for (var i = 0;i < inputs.length;i++) {
            if ($(inputs[i]).val() !== '') {
              searchParams[$(inputs[i]).attr('name')] = $(inputs[i]).val();
            }
          }
          $http({
            method: 'GET',
            url: '/reviews/api/v1/' + $scope.article.ratings[$scope.index].type + '/search',
            params: searchParams
          }).success(function (data) {
            $scope.searchResults = [];
            for (var key in data) {
              for (var index in data[key]) {
                $scope.searchResults.push(data[key][index]);
              }
            }
          });
        };

        $scope.mediaItemTemplate = function () {
          return $scope.MEDIA_ITEM_PARTIALS_URL + $scope.article.ratings[$scope.index].type.toLowerCase() + '.html' + $scope.CACHEBUSTER;
        };
        $scope.tvShowDisplay = function (x) {
          return x.name;
        };
        $scope.tvShowCallback = function (x, input, freeForm) {
          if (freeForm) {
            $scope.article.ratings[$scope.index].media_item.show = $(input).val();
          } else {
            $scope.article.ratings[$scope.index].media_item.show = x.name;
          }
        };
      },
      link: function (scope, element, attrs) {
        var $element = $(element);
        scope.index = attrs.index;
        scope.searchResults = [];

        $element.on('keypress', 'input.letter', function (e) {
          var chars = {
            65: 'A',
            66: 'B',
            67: 'C',
            68: 'D',
            70: 'F',
            97: 'A',
            98: 'B',
            99: 'C',
            100: 'D',
            102: 'F'
          };
          var mods = {
            45: '-',
            95: '_',
            43: '+',
            61: '+'
          };
          if (e.charCode in chars || e.charCode in mods) {
            var val = $(this).val();
            var oldChar = val.match(/[ABCDF]/);
            oldChar = oldChar ? oldChar[0] : '';
            var oldMod = val.match(/[+-]/);
            oldMod = oldMod ? oldMod[0] : '';
            var newVal;
            if (e.charCode in chars) {
              newVal = chars[e.charCode] + oldMod;
            }
            if (e.charCode in mods) {
              newVal = oldChar + mods[e.charCode];
            }
            $(this).val(newVal);
            $(this).trigger('input');
          }
          return false;

        });
        scope.searchTimeout = null;
        // $element.on('keydown', '.media-field input', function (e) {
        //     if (scope.searchTimeout !== null) {
        //         window.clearTimeout(scope.searchTimeout);
        //     }
        //     scope.searchTimeout = window.setTimeout(function () {
        //         scope.search($element);
        //     }, 250);
        // });

        $element.on('keyup', 'input[name="show"]', function (e) {
          var val = $element.find('input[name="show"]').val();
          $http({
            method: 'GET',
            url: '/reviews/api/v1/tvshow/?format=json',
            params: {'q': val}
          }).success(function (data) {
            scope.shows = data.results;
          });
        });

      }

    };
  });
