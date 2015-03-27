'use strict';

angular.module('specialCoverage.edit.videos.directive', [
  'apiServices.video.factory',
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest',
  'specialCoverage.edit.videos.video.directive',
  'ui.sortable'
])
  .directive('specialCoverageEditVideos', function (routes) {
    return {
      controller: function (_, $scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, Video) {

        $scope.writables = {
          searchTerm: ''
        };

        $scope.autocompleteItems = [];

        /**
         * Content moving function.
         *
         * @param {Number} indexFrom - Index to move content from.
         * @param {Number} indexTo - Index to move content to.
         * @returns {Boolean} true if content moved, false otherwise.
         */
        var moveTo = function (indexFrom, indexTo) {
          var ret = false;
          var videos = $scope.videos;
          if (indexFrom >= 0 && indexFrom < videos.length &&
              indexTo >= 0 && indexTo < videos.length) {
            var splicer = videos.splice(indexFrom, 1, videos[indexTo]);
            if (splicer.length > 0) {
              videos[indexTo] = splicer[0];
              ret = true;
            }
          }
          return ret;
        };
// TODO : make this autcomplete-basic
        var $getItems = function () {
          return Video.searchVideoHub($scope.writables.searchTerm)
            .then(function (data) {
              return _.map(data.results, function (video) {
                return {
                  name: 'ID: ' + video.id + ' | ' + video.name,
                  value: video
                };
              });
            });
        };

        $scope.moveUp = function (index) {
          moveTo(index, index - 1);
        };

        $scope.moveDown = function (index) {
          moveTo(index, index + 1);
        };

        $scope.delete = function (index) {
// TODO : fill this in
        };

        $scope.addVideo = function (video) {
// TODO : fill this in
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
      link: function (scope, iElement, iAttrs, ngModelCtrl) {
        ngModelCtrl.$formatters.push(function (modelValue) {
          scope.videos = modelValue;
        });
      },
      require: 'ngModel',
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'special-coverage/special-coverage-edit/special-coverage-edit-videos/special-coverage-edit-videos.html'
    };
  });
