'use strict';

angular.module('campaigns.edit.directive', [
  'apiServices.campaign.factory',
  'BettyCropper',
  'bulbsCmsApp.settings',
  'campaigns.edit.sponsorPixel',
  'lodash',
  'saveButton.directive',
  'topBar'
])
  .directive('campaignsEdit', function (COMPONENTS_URL) {
    return {
      controller: function (_, $location, $q, $routeParams, $scope, Campaign) {

        // populate model for use
        if ($routeParams.id === 'new') {
          $scope.model = Campaign.$build();
          $scope.isNew = true;
        } else {
          $scope.model = Campaign.$find($routeParams.id);
        }

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            // unsaved changes, show confirmation alert
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function() {
          // ensure even is cleaned up when we leave
          delete window.onbeforeunload;
        });

        $scope.addPixel = function () {
          var pixel = {
            url: '',
            campaign_type: ''
          };
          $scope.model.pixels.push(pixel);
        };

        $scope.deletePixel = function (pixel) {
          $scope.model.pixels = _.without($scope.model.pixels, pixel);
        };

        // set up save state function
        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            // have model, use save promise as deferred
            promise = $scope.model.$save().$asPromise().then(function (data) {
              $location.path('/cms/app/campaigns/edit/' + data.id + '/');
            });
          } else {
            // no model, this is an error, defer and reject
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: COMPONENTS_URL + 'campaigns/campaigns-edit/campaigns-edit.html',
    };
  });
