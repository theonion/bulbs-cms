'use strict';

angular.module('bulbs.cms.superFeatures.tab', [
  'autocompleteBasic',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'jquery',
  'ui.sortable',
  'bulbs.cms.superFeatures.tab.item',
  'bulbs.cms.superFeatures.api'
])
  .directive('superFeaturesTab', function ($, SuperFeaturesApi, CmsConfig) {
    return {
      controller: function (_, $scope, Utils, Video) {

        $scope.moveUp = function (index) {
          Utils.moveTo($scope.superFeatures, index, index - 1);
          $scope.onUpdate();
        };

        $scope.moveDown = function (index) {
          Utils.moveTo($scope.superFeatures, index, index + 1);
          $scope.onUpdate();
        };

        $scope.delete = function (index) {
          Utils.removeFrom($scope.superFeatures, index);
          $scope.onUpdate();
        };

        $scope.addSuperFeature = function (superFeature) {
          $scope.addSuperFeatureCallback({ superFeature: superFeature });
          $scope.onUpdate();
        };

        $scope.searchSuperFeature = function (query) {
          return SuperFeaturesApi.getSuperFeatures({search:query}).then(
            function(response) {
              return response.results;
          });
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
        superFeatures: '=',
        onUpdate: '&'
      },
      templateUrl: CmsConfig.buildComponentPath(
        'super-features',
        'super-features-tab',
        'super-features-tab.html'
      )
    };
  });
