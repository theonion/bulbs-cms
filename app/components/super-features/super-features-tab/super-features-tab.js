'use strict';

angular.module('bulbs.cms.superFeatures.tab', [
  'autocompleteBasic',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'jquery',
  'ui.sortable',
  'superFeatures.item.directive'
])
  .directive('superFeatureList', function ($, CmsConfig) {
    return {
      controller: function (_, $scope, Utils, Video) {

        $scope.moveUp = function (index) {
          Utils.moveTo($scope.super_features, index, index - 1);
          $scope.onUpdate();
        };

        $scope.moveDown = function (index) {
          Utils.moveTo($scope.super_features, index, index + 1);
          $scope.onUpdate();
        };

        $scope.delete = function (index) {
          Utils.removeFrom($scope.super_features, index);
          $scope.onUpdate();
        };

        $scope.addSuperFeature = function (super_feature) {
          // TODO: uh
          // $scope.addVideoCallback({video: video});
          $scope.onUpdate();
        };

        $scope.searchVideos = function (query) {
          // return Video.$postSearch({
          //   query: query,
          //   channel: VIDEOHUB_DEFAULT_CHANNEL
          // });
        };

      },
      link: function (scope, element, attr) {

        scope.sortableOptions = {
          beforeStop: function (e, ui) {
            ui.helper.css('margin-top', 0);
          },
          change: function (e, ui) {
            ui.helper.css('margin-top', $(window).scrollTop());
          },
          containment: 'super-feature-list',
          distance: 3,
          opacity: 0.75,
          placeholder: 'dropzone',
          start: function (e, ui) {
            ui.helper.css('margin-top', $(window).scrollTop());
          }
        };
      },
      restrict: 'E',
      scope: {
        addSuperFeatureCallback: '&addSuperFeature',
        videos: '=',
        onUpdate: '&'
      },
      templateUrl: CmsConfig.buildSharedPath('super-features-tab/super-features-tab.html')
    };
  });
